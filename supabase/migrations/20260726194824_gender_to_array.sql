ALTER TABLE public.products DROP CONSTRAINT products_gender_check;

ALTER TABLE public.products
  ALTER COLUMN gender TYPE text[]
  USING CASE WHEN gender IS NULL THEN NULL ELSE ARRAY[gender] END;

ALTER TABLE public.products
  ADD CONSTRAINT products_gender_check
  CHECK (gender IS NULL OR gender <@ ARRAY['men', 'women', 'unisex']::text[]);
;
