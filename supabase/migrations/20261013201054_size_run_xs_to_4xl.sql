-- Size run widened to XS–4XL; keeps the derived `sizes` array in garment order.
CREATE OR REPLACE FUNCTION sync_size_stock()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  v_total integer;
BEGIN
  IF NOT NEW.is_bundle AND NEW.size_stock IS NOT NULL AND NEW.size_stock <> '{}'::jsonb THEN
    SELECT COALESCE(SUM(value::int), 0) INTO v_total
    FROM jsonb_each_text(NEW.size_stock);

    NEW.stock := v_total;
    IF v_total = 0 THEN
      NEW.in_stock := false;
    END IF;

    SELECT array_agg(k ORDER BY COALESCE(array_position(ARRAY['XS','S','M','L','XL','XXL','3XL','4XL'], k), 99), k)
    INTO NEW.sizes
    FROM jsonb_object_keys(NEW.size_stock) k;
  END IF;
  RETURN NEW;
END;
$$;;
