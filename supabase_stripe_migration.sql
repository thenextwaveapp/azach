-- Add Stripe-related columns to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent_id ON orders(stripe_payment_intent_id);

-- Add unique constraint to prevent duplicate orders from webhooks
ALTER TABLE orders
ADD CONSTRAINT unique_stripe_session_id UNIQUE (stripe_session_id);
