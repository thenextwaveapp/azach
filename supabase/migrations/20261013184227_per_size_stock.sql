-- Per-size stock: JSONB map on products; total stock/in_stock/sizes derived by trigger.

ALTER TABLE products ADD COLUMN IF NOT EXISTS size_stock JSONB;

UPDATE products
SET size_stock = jsonb_build_object(sizes[1], stock)
WHERE size_stock IS NULL
  AND NOT is_bundle
  AND array_length(sizes, 1) = 1;

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

    SELECT array_agg(k ORDER BY COALESCE(array_position(ARRAY['S','M','L','XL','XXL'], k), 99), k)
    INTO NEW.sizes
    FROM jsonb_object_keys(NEW.size_stock) k;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_size_stock ON products;
CREATE TRIGGER trg_sync_size_stock
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION sync_size_stock();

CREATE OR REPLACE FUNCTION decrement_product_size_stock(p_id uuid, p_qty integer, p_size text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_size_stock jsonb;
  v_key text;
BEGIN
  SELECT size_stock INTO v_size_stock FROM products WHERE id = p_id;

  IF v_size_stock IS NOT NULL AND v_size_stock <> '{}'::jsonb THEN
    IF p_size IS NOT NULL AND v_size_stock ? p_size THEN
      v_key := p_size;
    ELSIF (SELECT count(*) FROM jsonb_object_keys(v_size_stock)) = 1 THEN
      SELECT k INTO v_key FROM jsonb_object_keys(v_size_stock) k;
    END IF;
  END IF;

  IF v_key IS NOT NULL THEN
    UPDATE products
    SET size_stock = jsonb_set(
          size_stock,
          ARRAY[v_key],
          to_jsonb(GREATEST(0, COALESCE((size_stock->>v_key)::int, 0) - p_qty))
        )
    WHERE id = p_id;
  ELSE
    UPDATE products
    SET stock = GREATEST(0, stock - p_qty),
        in_stock = GREATEST(0, stock - p_qty) > 0
    WHERE id = p_id;
  END IF;
END;
$$;

DROP FUNCTION IF EXISTS decrement_stock_for_purchase(uuid, integer);
CREATE FUNCTION decrement_stock_for_purchase(p_product_id uuid, p_quantity integer, p_size text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_is_bundle boolean;
  v_component RECORD;
BEGIN
  SELECT is_bundle INTO v_is_bundle FROM products WHERE id = p_product_id;

  IF v_is_bundle IS NULL THEN
    RETURN;
  END IF;

  IF v_is_bundle THEN
    FOR v_component IN
      SELECT id, bundle_quantity FROM products WHERE bundle_id = p_product_id
    LOOP
      PERFORM decrement_product_size_stock(v_component.id, v_component.bundle_quantity * p_quantity, p_size);
    END LOOP;
  ELSE
    PERFORM decrement_product_size_stock(p_product_id, p_quantity, p_size);
  END IF;
END;
$$;;
