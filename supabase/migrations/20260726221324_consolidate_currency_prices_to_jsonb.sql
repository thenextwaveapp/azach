ALTER TABLE public.products ADD COLUMN IF NOT EXISTS currency_prices JSONB NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.products SET currency_prices = jsonb_strip_nulls(jsonb_build_object(
  'USD', CASE WHEN price_usd IS NOT NULL OR original_price_usd IS NOT NULL
    THEN jsonb_build_object('price', price_usd, 'original_price', original_price_usd) END,
  'CAD', CASE WHEN price_cad IS NOT NULL OR original_price_cad IS NOT NULL
    THEN jsonb_build_object('price', price_cad, 'original_price', original_price_cad) END,
  'GBP', CASE WHEN price_gbp IS NOT NULL OR original_price_gbp IS NOT NULL
    THEN jsonb_build_object('price', price_gbp, 'original_price', original_price_gbp) END,
  'EUR', CASE WHEN price_eur IS NOT NULL OR original_price_eur IS NOT NULL
    THEN jsonb_build_object('price', price_eur, 'original_price', original_price_eur) END
));

ALTER TABLE public.products
  DROP COLUMN price_usd,
  DROP COLUMN price_cad,
  DROP COLUMN price_gbp,
  DROP COLUMN price_eur,
  DROP COLUMN original_price_usd,
  DROP COLUMN original_price_cad,
  DROP COLUMN original_price_gbp,
  DROP COLUMN original_price_eur;

COMMENT ON COLUMN public.products.currency_prices IS
  'Manually-set display prices per foreign currency, e.g. {"USD": {"price": 99.99, "original_price": 179.99}, "CAD": {...}}. Base truth is always the NGN price/original_price columns — checkout always charges NGN via Paystack regardless of this.';
;
