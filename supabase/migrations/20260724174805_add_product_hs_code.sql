
ALTER TABLE products ADD COLUMN hs_code text;
COMMENT ON COLUMN products.hs_code IS 'Harmonized System / commodity code for customs declarations on international shipments.';
;
