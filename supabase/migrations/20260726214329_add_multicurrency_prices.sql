ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS price_usd NUMERIC,
  ADD COLUMN IF NOT EXISTS price_cad NUMERIC,
  ADD COLUMN IF NOT EXISTS price_gbp NUMERIC,
  ADD COLUMN IF NOT EXISTS price_eur NUMERIC;

COMMENT ON COLUMN public.products.price_usd IS 'Manually-set display price in US Dollars (browsing only; checkout always charges the NGN price via Paystack)';
COMMENT ON COLUMN public.products.price_cad IS 'Manually-set display price in Canadian Dollars (browsing only; checkout always charges the NGN price via Paystack)';
COMMENT ON COLUMN public.products.price_gbp IS 'Manually-set display price in British Pounds (browsing only; checkout always charges the NGN price via Paystack)';
COMMENT ON COLUMN public.products.price_eur IS 'Manually-set display price in Euros (browsing only; checkout always charges the NGN price via Paystack)';
;
