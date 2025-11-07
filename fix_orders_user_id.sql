-- Make user_id nullable to allow guest checkouts
ALTER TABLE orders
ALTER COLUMN user_id DROP NOT NULL;
