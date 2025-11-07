import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Currency = 'USD' | 'CAD';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  exchangeRate: number;
  convertPrice: (priceUSD: number) => number;
  formatPrice: (priceUSD: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const CURRENCY_STORAGE_KEY = 'azach-currency';

// Fetch exchange rate from API
const fetchExchangeRate = async (): Promise<number> => {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    return data.rates.CAD || 1.35; // Fallback to 1.35 if API fails
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    return 1.35; // Fallback exchange rate
  }
};

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const stored = localStorage.getItem(CURRENCY_STORAGE_KEY);
    return (stored as Currency) || 'USD';
  });
  const [exchangeRate, setExchangeRate] = useState<number>(1.35);

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

  // Convert USD price to selected currency
  const convertPrice = (priceUSD: number): number => {
    if (currency === 'USD') return priceUSD;
    return priceUSD * exchangeRate;
  };

  // Format price with currency symbol
  const formatPrice = (priceUSD: number): string => {
    const price = convertPrice(priceUSD);
    if (currency === 'USD') {
      return `$${price.toFixed(2)}`;
    }
    return `CA$${price.toFixed(2)}`;
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
