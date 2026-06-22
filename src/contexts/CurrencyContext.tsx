import { createContext, useContext, ReactNode } from "react";

interface CurrencyContextType {
  formatPrice: (priceNGN: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  // Format price in NGN only
  const formatPrice = (priceNGN: number): string => {
    return `₦${Math.round(priceNGN).toLocaleString('en-NG')}`;
  };

  return (
    <CurrencyContext.Provider value={{ formatPrice }}>
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
