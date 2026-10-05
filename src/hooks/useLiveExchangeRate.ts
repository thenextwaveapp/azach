import { useQuery } from '@tanstack/react-query';

// Live exchange rates for every currency, base USD (rate[code] = units of `code` per 1 USD).
// Used to (a) display product prices in a visitor's local currency purely for show, and
// (b) convert whatever currency is on screen into the NGN amount actually charged via
// Paystack (which only settles NGN on this account). Free, no-key, CORS-enabled, daily updates.
async function fetchRates(): Promise<Record<string, number>> {
  const res = await fetch('https://open.er-api.com/v6/latest/USD');
  if (!res.ok) throw new Error('Failed to fetch exchange rates');
  const data = await res.json();
  if (!data?.rates?.NGN) throw new Error('Rates missing from response');
  return data.rates;
}

export const useLiveExchangeRates = () => {
  return useQuery({
    queryKey: ['live-exchange-rates'],
    queryFn: fetchRates,
    staleTime: 60 * 60 * 1000, // an hour — the source itself only updates daily
    retry: 1,
  });
};
