-- Size run now also includes UK dress sizes 6-28 (female garments); keep the
-- derived `sizes` array in garment order across both systems.
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

    SELECT array_agg(k ORDER BY COALESCE(array_position(
      ARRAY['XS','S','M','L','XL','XXL','3XL','4XL',
            'UK 6','UK 8','UK 10','UK 12','UK 14','UK 16','UK 18','UK 20','UK 22','UK 24','UK 26','UK 28'],
      k), 99), k)
    INTO NEW.sizes
    FROM jsonb_object_keys(NEW.size_stock) k;
  END IF;
  RETURN NEW;
END;
$$;;
