
ALTER TABLE products
  ADD COLUMN set_id text,
  ADD COLUMN set_role text;

CREATE INDEX IF NOT EXISTS idx_products_set_id ON products(set_id);

COMMENT ON COLUMN products.set_id IS 'Freeform code grouping products sold together as a set (e.g. matching top/bottom).';
COMMENT ON COLUMN products.set_role IS 'Role of this piece within its set, e.g. Top, Bottom, Full Set.';
;
