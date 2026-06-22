-- Add shipping fields to products table for DHL Express integration
-- Migration: 001_add_shipping_fields.sql
-- Created: 2026-06-21

-- Add weight and dimensions columns to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(10, 2) DEFAULT 0.5 CHECK (weight_kg > 0),
ADD COLUMN IF NOT EXISTS length_cm DECIMAL(10, 2) DEFAULT 20 CHECK (length_cm > 0),
ADD COLUMN IF NOT EXISTS width_cm DECIMAL(10, 2) DEFAULT 15 CHECK (width_cm > 0),
ADD COLUMN IF NOT EXISTS height_cm DECIMAL(10, 2) DEFAULT 10 CHECK (height_cm > 0);

-- Add comments for documentation
COMMENT ON COLUMN products.weight_kg IS 'Product weight in kilograms for shipping calculation';
COMMENT ON COLUMN products.length_cm IS 'Package length in centimeters for shipping calculation';
COMMENT ON COLUMN products.width_cm IS 'Package width in centimeters for shipping calculation';
COMMENT ON COLUMN products.height_cm IS 'Package height in centimeters for shipping calculation';

-- Create index on weight for faster DHL rate calculations
CREATE INDEX IF NOT EXISTS idx_products_weight ON products(weight_kg);

-- Update existing products with default shipping dimensions
-- These can be updated manually in the admin panel later
UPDATE products
SET
  weight_kg = COALESCE(weight_kg, 0.5),
  length_cm = COALESCE(length_cm, 20),
  width_cm = COALESCE(width_cm, 15),
  height_cm = COALESCE(height_cm, 10)
WHERE weight_kg IS NULL OR length_cm IS NULL OR width_cm IS NULL OR height_cm IS NULL;
