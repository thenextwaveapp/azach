import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Currency = 'USD' | 'CAD';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  exchangeRate: number;
  convertPrice: (priceCAD: number) => number;
  formatPrice: (priceCAD: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const CURRENCY_STORAGE_KEY = 'azach-currency';

// Fetch exchange rate from API (CAD to USD)
const fetchExchangeRate = async (): Promise<number> => {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/CAD');
    const data = await response.json();
    return data.rates.USD || 0.74; // Fallback to 0.74 if API fails (1 CAD = ~0.74 USD)
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    return 0.74; // Fallback exchange rate
  }
};

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const stored = localStorage.getItem(CURRENCY_STORAGE_KEY);
    return (stored as Currency) || 'CAD';
  });
  const [exchangeRate, setExchangeRate] = useState<number>(0.74);

  // Fetch exchange rate on mount and every hour
  useEffect(() => {
    const updateExchangeRate = async () => {
      const rate = await fetchExchangeRate();
      setExchangeRate(rate);
    };

    updateExchangeRate();
    const interval = setInterval(updateExchangeRate, 60 * 60 * 1000); // Update every hour

    return () => clearInterval(interval);
  }, []);

  // Save currency preference to localStorage
  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
  };

  // Convert CAD price to selected currency
  const convertPrice = (priceCAD: number): number => {
    if (currency === 'CAD') return priceCAD;
    return priceCAD * exchangeRate; // Convert CAD to USD
  };

  // Format price with currency symbol
  const formatPrice = (priceCAD: number): string => {
    const price = convertPrice(priceCAD);
    if (currency === 'CAD') {
      return `CA$${price.toFixed(2)}`;
    }
    return `$${price.toFixed(2)}`; // USD
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        exchangeRate,
        convertPrice,
        formatPrice,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};
