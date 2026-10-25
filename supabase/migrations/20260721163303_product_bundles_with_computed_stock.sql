
-- Reset the one experimental row from the old freeform set_id feature
UPDATE products SET set_id = NULL, set_role = NULL WHERE set_id IS NOT NULL;

ALTER TABLE products RENAME COLUMN set_role TO bundle_role;
ALTER TABLE products DROP COLUMN set_id;

ALTER TABLE products
  ADD COLUMN is_bundle boolean NOT NULL DEFAULT false,
  ADD COLUMN bundle_id uuid REFERENCES products(id) ON DELETE SET NULL,
  ADD COLUMN bundle_quantity integer NOT NULL DEFAULT 1 CHECK (bundle_quantity > 0);

ALTER TABLE products
  ADD CONSTRAINT bundle_not_self CHECK (bundle_id IS NULL OR bundle_id <> id),
  ADD CONSTRAINT bundle_cannot_be_component CHECK (NOT (is_bundle AND bundle_id IS NOT NULL));

CREATE INDEX idx_products_bundle_id ON products(bundle_id);

COMMENT ON COLUMN products.is_bundle IS 'True if this product is a set/kit whose stock is computed from its components, not entered manually.';
COMMENT ON COLUMN products.bundle_id IS 'If set, this product is a component of the referenced bundle product.';
COMMENT ON COLUMN products.bundle_quantity IS 'How many units of this component are consumed per 1 unit of the bundle.';
COMMENT ON COLUMN products.bundle_role IS 'Display label for this piece within its bundle, e.g. Jacket, Trousers.';

-- A component's target bundle_id must point at an actual bundle product
CREATE OR REPLACE FUNCTION validate_bundle_id()
RETURNS trigger AS $$
BEGIN
  IF NEW.bundle_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM products WHERE id = NEW.bundle_id AND is_bundle) THEN
      RAISE EXCEPTION 'bundle_id must reference a product with is_bundle = true';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_validate_bundle_id
  BEFORE INSERT OR UPDATE OF bundle_id ON products
  FOR EACH ROW EXECUTE FUNCTION validate_bundle_id();

-- Available bundle stock = the scarcest component, accounting for quantity required
CREATE OR REPLACE FUNCTION compute_bundle_stock(p_bundle_id uuid)
RETURNS integer AS $$
DECLARE
  v_stock integer;
BEGIN
  SELECT COALESCE(MIN(FLOOR(c.stock::numeric / c.bundle_quantity)), 0)::int
  INTO v_stock
  FROM products c
  WHERE c.bundle_id = p_bundle_id;

  RETURN GREATEST(v_stock, 0);
END;
$$ LANGUAGE plpgsql STABLE SET search_path = public;

-- A bundle's own stock/in_stock is always system-computed, never hand-entered
CREATE OR REPLACE FUNCTION enforce_bundle_computed_stock()
RETURNS trigger AS $$
BEGIN
  IF NEW.is_bundle THEN
    NEW.stock := compute_bundle_stock(NEW.id);
    NEW.in_stock := NEW.stock > 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_enforce_bundle_computed_stock
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION enforce_bundle_computed_stock();

-- Whenever a component's stock/quantity/bundle changes, recompute its bundle's stock
CREATE OR REPLACE FUNCTION recalc_dependent_bundle()
RETURNS trigger AS $$
DECLARE
  v_bundle_id uuid;
  v_old_bundle_id uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_bundle_id := OLD.bundle_id;
    v_old_bundle_id := NULL;
  ELSE
    v_bundle_id := NEW.bundle_id;
    v_old_bundle_id := CASE WHEN TG_OP = 'UPDATE' THEN OLD.bundle_id ELSE NULL END;
  END IF;

  IF v_bundle_id IS NOT NULL THEN
    UPDATE products
    SET stock = compute_bundle_stock(v_bundle_id),
        in_stock = compute_bundle_stock(v_bundle_id) > 0
    WHERE id = v_bundle_id;
  END IF;

  IF v_old_bundle_id IS NOT NULL AND v_old_bundle_id IS DISTINCT FROM v_bundle_id THEN
    UPDATE products
    SET stock = compute_bundle_stock(v_old_bundle_id),
        in_stock = compute_bundle_stock(v_old_bundle_id) > 0
    WHERE id = v_old_bundle_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_recalc_dependent_bundle
  AFTER INSERT OR DELETE OR UPDATE OF stock, bundle_quantity, bundle_id ON products
  FOR EACH ROW EXECUTE FUNCTION recalc_dependent_bundle();

-- Centralized, bundle-aware stock decrement used at checkout fulfillment time.
-- For a bundle purchase, decrements each component by (bundle_quantity * quantity purchased)
-- instead of the bundle's own (computed) stock column.
CREATE OR REPLACE FUNCTION decrement_stock_for_purchase(p_product_id uuid, p_quantity integer)
RETURNS void AS $$
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
      SELECT id, stock, bundle_quantity FROM products WHERE bundle_id = p_product_id
    LOOP
      UPDATE products
      SET stock = GREATEST(0, v_component.stock - (v_component.bundle_quantity * p_quantity)),
          in_stock = GREATEST(0, v_component.stock - (v_component.bundle_quantity * p_quantity)) > 0
      WHERE id = v_component.id;
    END LOOP;
  ELSE
    UPDATE products
    SET stock = GREATEST(0, stock - p_quantity),
        in_stock = GREATEST(0, stock - p_quantity) > 0
    WHERE id = p_product_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
;
