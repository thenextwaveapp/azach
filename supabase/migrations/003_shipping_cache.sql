-- Create shipping rate cache table for DHL Express rates
-- Migration: 003_shipping_cache.sql
-- Created: 2026-06-21

-- Create shipping_rate_cache table
CREATE TABLE IF NOT EXISTS shipping_rate_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cart_hash TEXT NOT NULL,
  destination_country TEXT NOT NULL,
  destination_postal_code TEXT,
  total_weight_kg DECIMAL(10, 2) NOT NULL CHECK (total_weight_kg > 0),
  rate_ngn DECIMAL(10, 2) NOT NULL CHECK (rate_ngn >= 0),
  currency_code TEXT DEFAULT 'NGN',
  service_type TEXT,
  estimated_days INTEGER,
  dhl_product_code TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE shipping_rate_cache IS 'Caches DHL Express shipping rates to reduce API calls (30 min TTL)';
COMMENT ON COLUMN shipping_rate_cache.cart_hash IS 'Hash of cart items (product IDs + quantities) for cache key';
COMMENT ON COLUMN shipping_rate_cache.destination_country IS 'ISO 2-letter country code for destination';
COMMENT ON COLUMN shipping_rate_cache.destination_postal_code IS 'Destination postal/ZIP code';
COMMENT ON COLUMN shipping_rate_cache.total_weight_kg IS 'Total weight of cart items in kilograms';
COMMENT ON COLUMN shipping_rate_cache.rate_ngn IS 'Shipping rate in Nigerian Naira';
COMMENT ON COLUMN shipping_rate_cache.service_type IS 'DHL service type name (e.g., Express Worldwide)';
COMMENT ON COLUMN shipping_rate_cache.estimated_days IS 'Estimated delivery days from DHL';
COMMENT ON COLUMN shipping_rate_cache.dhl_product_code IS 'DHL product code for shipment creation';
COMMENT ON COLUMN shipping_rate_cache.expires_at IS 'Cache expiration timestamp (typically 30 minutes from creation)';

-- Create indexes for efficient cache lookups
CREATE INDEX IF NOT EXISTS idx_shipping_cache_hash ON shipping_rate_cache(cart_hash);
CREATE INDEX IF NOT EXISTS idx_shipping_cache_country ON shipping_rate_cache(destination_country);
CREATE INDEX IF NOT EXISTS idx_shipping_cache_expires ON shipping_rate_cache(expires_at);

-- Create composite index for cache key lookup
CREATE INDEX IF NOT EXISTS idx_shipping_cache_lookup
ON shipping_rate_cache(cart_hash, destination_country, destination_postal_code)
WHERE expires_at > NOW();

-- Function to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_shipping_cache()
RETURNS INTEGER AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM shipping_rate_cache WHERE expires_at <= NOW();
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_expired_shipping_cache IS 'Deletes expired shipping rate cache entries and returns count deleted';

-- Enable RLS (Row Level Security) on shipping_rate_cache
ALTER TABLE shipping_rate_cache ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow public read access to cache (for guest checkout)
CREATE POLICY "Allow public read access to shipping cache"
ON shipping_rate_cache FOR SELECT
TO anon, authenticated
USING (expires_at > NOW());

-- Allow public insert for caching new rates
CREATE POLICY "Allow public insert to shipping cache"
ON shipping_rate_cache FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow public delete for cache cleanup
CREATE POLICY "Allow public delete expired cache"
ON shipping_rate_cache FOR DELETE
TO anon, authenticated
USING (expires_at <= NOW());

-- Grant necessary permissions
GRANT SELECT, INSERT, DELETE ON shipping_rate_cache TO anon, authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_shipping_cache TO anon, authenticated;
