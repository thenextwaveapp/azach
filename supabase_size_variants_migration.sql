-- Size Variants Migration
-- Size moves from an admin-set attribute to a customer-selectable option:
--   * products.sizes     — which sizes a product is offered in (admin picks)
--   * cart_items.selected_size — the size the customer chose (also widens the
--     uniqueness rule so the same product in two sizes is two cart lines)
--   * order_items.selected_size — the chosen size recorded on the order
-- Run BEFORE deploying the frontend/functions that reference these columns.

-- Products: list of offered sizes. Legacy single-size pieces keep working via the
-- old `size` column (frontend falls back to it), but we backfill where possible.
ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes TEXT[];
UPDATE products
SET sizes = ARRAY[size]
WHERE sizes IS NULL AND size IS NOT NULL AND size <> '';

-- Cart: the chosen size is part of the line-item identity. Empty string (not NULL)
-- for size-less products, so the UNIQUE constraint actually dedupes them.
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS selected_size TEXT NOT NULL DEFAULT '';
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_user_id_product_id_key;
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_user_product_size_key;
ALTER TABLE cart_items
  ADD CONSTRAINT cart_items_user_product_size_key UNIQUE (user_id, product_id, selected_size);

-- Orders: record what size the customer bought.
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS selected_size TEXT;
