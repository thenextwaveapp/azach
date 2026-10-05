import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { ForeignCurrency, CurrencyPrices } from "@/types/product";
import { useLiveExchangeRates } from "@/hooks/useLiveExchangeRate";

// NGN and USD are "real": NGN is the base price column, USD is a manually-set,
// psychologically-priced anchor stored per product. Every other currency is purely a
// visual conversion of the USD anchor at the live rate — nothing else is stored for them.
export type CurrencyCode = "NGN" | ForeignCurrency | "CAD" | "GBP" | "EUR" | "AUD";

type PriceTier = "price" | "original_price";
type PricedProduct = { price: number; original_price?: number; currency_prices?: CurrencyPrices };

const CURRENCY_STORAGE_KEY = "azach-currency-override";

const SYMBOLS: Record<CurrencyCode, string> = {
  NGN: "₦",
  USD: "$",
  CAD: "CA$",
  GBP: "£",
  EUR: "€",
  AUD: "A$",
};

const LOCALES: Record<CurrencyCode, string> = {
  NGN: "en-NG",
  USD: "en-US",
  CAD: "en-CA",
  GBP: "en-GB",
  EUR: "en-IE",
  AUD: "en-AU",
};

const EU_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU",
  "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
]);

// azach.ng is the only domain that ever shows NGN — azach.ca is reserved for the rest
// of the world (the edge middleware already redirects non-Nigerian visitors there), so
// NGN must never appear there by default, by IP-detection fallback, or as an option.
export function isNaijaSite(): boolean {
  return typeof window !== "undefined" && window.location.hostname.endsWith("azach.ng");
}

// A handful of major markets get their own currency purely for display; everyone else
// (and Nigeria itself, when detected on the non-.ng domain) defaults to USD.
function countryToCurrency(countryCode: string | undefined, allowNGN: boolean): CurrencyCode {
  if (countryCode === "NG") return allowNGN ? "NGN" : "USD";
  if (countryCode === "CA") return "CAD";
  if (countryCode === "GB") return "GBP";
  if (countryCode === "AU") return "AUD";
  if (countryCode && EU_COUNTRIES.has(countryCode)) return "EUR";
  return "USD";
}

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  // Resolves one price tier ("price" or "original_price") for a product in the current
  // currency. NGN and USD are real stored values; every other currency is the USD anchor
  // converted at the live rate (falling back to the NGN value converted to USD if no USD
  // anchor is set). Returns null if the tier itself is unset (e.g. no discount).
  getPrice: (product: PricedProduct, tier?: PriceTier) => { amount: number; currency: CurrencyCode } | null;
  // Formats a product's price in the current display currency.
  formatDisplayPrice: (product: PricedProduct, tier?: PriceTier) => string | null;
  // Formats a plain NGN amount in NGN specifically — for things that are always NGN
  // regardless of browsing currency (e.g. historical NGN-charged order records).
  formatNGN: (amountNGN: number) => string;
  // Converts and formats a raw NGN amount (e.g. a DB-driven price filter bound, a DHL
  // shipping quote) into the current browsing currency at the live rate — visual only,
  // the underlying value/query this labels usually stays in NGN.
  formatFromNGN: (amountNGN: number) => string;
  // Formats an amount that's already in a known, fixed currency — for historical
  // records like past orders, which were charged in whatever currency they recorded,
  // independent of what currency the current visitor happens to be browsing in.
  formatAsCurrency: (amount: number, currency: CurrencyCode) => string;
  // Formats a running total for a set of cart-style line items (price × quantity) in
  // the current browsing currency.
  formatCartTotal: (items: (PricedProduct & { quantity: number })[]) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

function formatMoney(amount: number, currency: CurrencyCode): string {
  return `${SYMBOLS[currency]}${Math.round(amount).toLocaleString(LOCALES[currency])}`;
}

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const naijaSite = isNaijaSite();
  // Domain-correct from the very first render — no NGN flash on azach.ca while IP
  // detection (which can be slow, blocked, or simply fail) resolves in the background.
  const [currency, setCurrencyState] = useState<CurrencyCode>(naijaSite ? "NGN" : "USD");
  const { data: rates } = useLiveExchangeRates();

  useEffect(() => {
    const stored = localStorage.getItem(CURRENCY_STORAGE_KEY) as CurrencyCode | null;
    // Ignore a stored NGN preference on the non-.ng domain — it should never be reachable there.
    if (stored && (naijaSite || stored !== "NGN")) {
      setCurrencyState(stored);
      return;
    }

    // No usable manual preference — refine from IP in the background for finer-grained
    // display currencies (CAD/GBP/EUR/AUD). Never blocks rendering, and if detection
    // fails or is slow, the domain-correct default above simply stays in place.
    // geojs.io: free, HTTPS, no key, no hard rate limit (ipapi.co's free tier returns
    // 429 far too often in practice, which silently stranded visitors on the fallback).
    fetch("https://get.geojs.io/v1/ip/geo.json")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.country_code) {
          setCurrencyState(countryToCurrency(data.country_code, naijaSite));
        }
      })
      .catch(() => {
        // Keep the domain-correct default if geolocation fails.
      });
  }, [naijaSite]);

  const setCurrency = (next: CurrencyCode) => {
    // NGN is azach.ng-only, even for a direct/programmatic call.
    if (next === "NGN" && !naijaSite) return;
    setCurrencyState(next);
    localStorage.setItem(CURRENCY_STORAGE_KEY, next);
  };

  const getPrice = (product: PricedProduct, tier: PriceTier = "price") => {
    const ngnValue = product[tier];

    if (currency === "NGN") {
      return ngnValue != null ? { amount: ngnValue, currency: "NGN" as CurrencyCode } : null;
    }

    // USD is the real, manually-set anchor. Fall back to converting the NGN value if unset.
    let usdAmount = product.currency_prices?.USD?.[tier] ?? null;
    if (usdAmount == null && ngnValue != null && rates?.NGN) {
      usdAmount = ngnValue / rates.NGN;
    }
    if (usdAmount == null) return null;

    if (currency === "USD") {
      return { amount: usdAmount, currency: "USD" as CurrencyCode };
    }

    // Every other currency is purely visual: the USD anchor converted at the live rate.
    if (!rates?.[currency]) {
      return { amount: usdAmount, currency: "USD" as CurrencyCode };
    }
    return { amount: usdAmount * rates[currency], currency };
  };

  const formatDisplayPrice = (product: PricedProduct, tier: PriceTier = "price"): string | null => {
    const resolved = getPrice(product, tier);
    return resolved ? formatMoney(resolved.amount, resolved.currency) : null;
  };

  const formatNGN = (amountNGN: number): string => formatMoney(amountNGN, "NGN");

  const formatFromNGN = (amountNGN: number): string => {
    if (currency === "NGN" || !rates?.[currency] || !rates?.NGN) {
      return formatMoney(amountNGN, "NGN");
    }
    return formatMoney((amountNGN / rates.NGN) * rates[currency], currency);
  };

  const formatAsCurrency = (amount: number, code: CurrencyCode): string => formatMoney(amount, code);

  const formatCartTotal = (items: (PricedProduct & { quantity: number })[]): string => {
    const total = items.reduce((sum, item) => {
      const resolved = getPrice(item, "price");
      return sum + (resolved?.amount ?? 0) * item.quantity;
    }, 0);
    return formatMoney(total, currency);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, getPrice, formatDisplayPrice, formatNGN, formatFromNGN, formatAsCurrency, formatCartTotal }}>
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
