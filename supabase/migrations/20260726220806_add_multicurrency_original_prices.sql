ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS original_price_usd NUMERIC,
  ADD COLUMN IF NOT EXISTS original_price_cad NUMERIC,
  ADD COLUMN IF NOT EXISTS original_price_gbp NUMERIC,
  ADD COLUMN IF NOT EXISTS original_price_eur NUMERIC;

COMMENT ON COLUMN public.products.original_price_usd IS 'Manually-set strikethrough (pre-discount) display price in US Dollars';
COMMENT ON COLUMN public.products.original_price_cad IS 'Manually-set strikethrough (pre-discount) display price in Canadian Dollars';
COMMENT ON COLUMN public.products.original_price_gbp IS 'Manually-set strikethrough (pre-discount) display price in British Pounds';
COMMENT ON COLUMN public.products.original_price_eur IS 'Manually-set strikethrough (pre-discount) display price in Euros';
;
