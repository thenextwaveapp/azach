-- Add Paystack payment and DHL tracking fields to orders table
-- Migration: 002_paystack_orders.sql
-- Created: 2026-06-21

-- Add Paystack payment fields
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS paystack_reference TEXT,
ADD COLUMN IF NOT EXISTS paystack_access_code TEXT,
ADD COLUMN IF NOT EXISTS payment_provider TEXT DEFAULT 'stripe' CHECK (payment_provider IN ('stripe', 'paystack'));

-- Add DHL Express tracking fields
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS dhl_tracking_number TEXT,
ADD COLUMN IF NOT EXISTS dhl_shipment_id TEXT,
ADD COLUMN IF NOT EXISTS dhl_label_url TEXT,
ADD COLUMN IF NOT EXISTS estimated_delivery_date TIMESTAMP WITH TIME ZONE;

-- Add comments for documentation
COMMENT ON COLUMN orders.paystack_reference IS 'Paystack transaction reference ID';
COMMENT ON COLUMN orders.paystack_access_code IS 'Paystack access code for transaction verification';
COMMENT ON COLUMN orders.payment_provider IS 'Payment gateway used: stripe or paystack';
COMMENT ON COLUMN orders.dhl_tracking_number IS 'DHL Express tracking/waybill number';
COMMENT ON COLUMN orders.dhl_shipment_id IS 'DHL Express shipment identification number';
COMMENT ON COLUMN orders.dhl_label_url IS 'URL to download DHL shipping label PDF';
COMMENT ON COLUMN orders.estimated_delivery_date IS 'Estimated delivery date from DHL';

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_orders_paystack_reference ON orders(paystack_reference);
CREATE INDEX IF NOT EXISTS idx_orders_dhl_tracking ON orders(dhl_tracking_number);
CREATE INDEX IF NOT EXISTS idx_orders_payment_provider ON orders(payment_provider);

-- Add unique constraint on Paystack reference to prevent duplicate webhook processing
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_paystack_reference_unique
ON orders(paystack_reference)
WHERE paystack_reference IS NOT NULL;

-- Make Stripe fields nullable for Paystack orders
-- Note: These columns might already be nullable, this ensures they are
ALTER TABLE orders
ALTER COLUMN stripe_session_id DROP NOT NULL,
ALTER COLUMN stripe_payment_intent_id DROP NOT NULL;

-- Update existing orders to set payment provider
UPDATE orders
SET payment_provider = 'stripe'
WHERE payment_provider IS NULL AND (stripe_session_id IS NOT NULL OR stripe_payment_intent_id IS NOT NULL);
