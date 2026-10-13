-- Per-Size Stock Migration
-- Stock moves from one count per product to a count per size, stored as a JSONB map
-- on the product (e.g. {"M": 2, "XL": 1}). The existing total `stock`, `in_stock`,
-- and `sizes` columns become derived from it (kept in sync by trigger) so everything
-- that reads them — bundle stock computation, sorting, availability badges — keeps
-- working unchanged. Bundles themselves keep total-stock semantics (their stock is
-- computed from component totals as before); a sized bundle purchase decrements the
-- matching size bucket on each component.

ALTER TABLE products ADD COLUMN IF NOT EXISTS size_stock JSONB;

-- Backfill: every sized product today is single-size (one-of-one pieces), so its
-- whole stock belongs to that one size.
UPDATE products
SET size_stock = jsonb_build_object(sizes[1], stock)
WHERE size_stock IS NULL
  AND NOT is_bundle
  AND array_length(sizes, 1) = 1;

-- Keep stock / in_stock / sizes derived from size_stock on sized, non-bundle
-- products. in_stock is only forced false at zero — a manual "hide product"
-- untick survives restocks.
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
$$;

DROP TRIGGER IF EXISTS trg_sync_size_stock ON products;
CREATE TRIGGER trg_sync_size_stock
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION sync_size_stock();

-- Decrement one product's stock, in the right size bucket when one applies.
-- Falls back to the product's only size for legacy cart lines that carry no size,
-- and to the plain total for size-less products.
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
    -- stock / in_stock recomputed by trg_sync_size_stock
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

-- Replace the 2-arg decrement with a 3-arg version (size defaults to NULL so the
-- currently-deployed edge functions keep working until they're redeployed). The old
-- signature must be dropped — keeping both would make PostgREST rpc calls ambiguous.
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
$$;
