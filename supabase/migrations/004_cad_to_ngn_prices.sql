-- Migrate product prices from CAD to NGN
-- Migration: 004_cad_to_ngn_prices.sql
-- Created: 2026-06-21
-- WARNING: This migration modifies all product prices. Ensure backup exists before running.

-- Create price migrations tracking table
CREATE TABLE IF NOT EXISTS price_migrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  migration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  exchange_rate DECIMAL(10, 4) NOT NULL,
  products_affected INTEGER NOT NULL,
  notes TEXT
);

COMMENT ON TABLE price_migrations IS 'Tracks currency conversions applied to product pricing';

-- Create backup of current prices before migration
CREATE TABLE IF NOT EXISTS products_price_backup_20260621 AS
SELECT id, name, price, original_price, created_at, updated_at
FROM products;

COMMENT ON TABLE products_price_backup_20260621 IS 'Backup of product prices before CAD to NGN migration';

-- Apply currency conversion: 1 CAD ≈ 1450 NGN (June 2026 rate)
-- Adjust this rate based on actual market rate at time of migration
DO $$
DECLARE
  v_exchange_rate DECIMAL(10, 4) := 1450.00;
  v_products_count INTEGER;
BEGIN
  -- Update all product prices
  UPDATE products
  SET
    price = ROUND(price * v_exchange_rate, 2),
    original_price = CASE
      WHEN original_price IS NOT NULL THEN ROUND(original_price * v_exchange_rate, 2)
      ELSE NULL
    END,
    updated_at = NOW();

  -- Get count of affected products
  GET DIAGNOSTICS v_products_count = ROW_COUNT;

  -- Record the migration
  INSERT INTO price_migrations (from_currency, to_currency, exchange_rate, products_affected, notes)
  VALUES (
    'CAD',
    'NGN',
    v_exchange_rate,
    v_products_count,
    'Automatic migration from CAD to NGN base currency for Nigerian market. Backup saved to products_price_backup_20260621.'
  );

  -- Log the migration
  RAISE NOTICE 'Price migration completed: % products converted from CAD to NGN at rate %.2f', v_products_count, v_exchange_rate;
END $$;

-- Enable RLS on price_migrations table
ALTER TABLE price_migrations ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for price migrations (admin read-only)
CREATE POLICY "Allow authenticated read access to price migrations"
ON price_migrations FOR SELECT
TO authenticated
USING (true);

GRANT SELECT ON price_migrations TO authenticated;

-- Verification query (run this manually after migration to verify)
-- SELECT
--   'Before Migration' as status,
--   id, name, price as old_price
-- FROM products_price_backup_20260621
-- LIMIT 5;
--
-- SELECT
--   'After Migration' as status,
--   id, name, price as new_price_ngn
-- FROM products
-- LIMIT 5;
--
-- SELECT * FROM price_migrations ORDER BY migration_date DESC LIMIT 1;
