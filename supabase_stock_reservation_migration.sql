-- Stock Reservation Migration
-- Prevents race conditions during checkout

-- Create stock_reservations table
CREATE TABLE IF NOT EXISTS stock_reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  session_id TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_stock_reservations_product_id ON stock_reservations(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_reservations_session_id ON stock_reservations(session_id);
CREATE INDEX IF NOT EXISTS idx_stock_reservations_expires_at ON stock_reservations(expires_at);

-- Enable Row Level Security
ALTER TABLE stock_reservations ENABLE ROW LEVEL SECURITY;

-- Anyone can view reservations (needed for stock calculations)
DROP POLICY IF EXISTS "Reservations are viewable by everyone" ON stock_reservations;
CREATE POLICY "Reservations are viewable by everyone"
  ON stock_reservations FOR SELECT
  USING (true);

-- Anyone can insert reservations
DROP POLICY IF EXISTS "Anyone can create reservations" ON stock_reservations;
CREATE POLICY "Anyone can create reservations"
  ON stock_reservations FOR INSERT
  WITH CHECK (true);

-- Anyone can delete expired reservations
DROP POLICY IF EXISTS "Anyone can delete reservations" ON stock_reservations;
CREATE POLICY "Anyone can delete reservations"
  ON stock_reservations FOR DELETE
  USING (true);

-- Function to get available stock (total stock minus reserved)
CREATE OR REPLACE FUNCTION get_available_stock(p_product_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_total_stock INTEGER;
  v_reserved INTEGER;
BEGIN
  -- Get total stock
  SELECT stock INTO v_total_stock
  FROM products
  WHERE id = p_product_id;

  -- Get reserved stock (excluding expired reservations)
  SELECT COALESCE(SUM(quantity), 0) INTO v_reserved
  FROM stock_reservations
  WHERE product_id = p_product_id
    AND expires_at > NOW();

  RETURN GREATEST(v_total_stock - v_reserved, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reserve stock
CREATE OR REPLACE FUNCTION reserve_stock(
  p_product_id UUID,
  p_quantity INTEGER,
  p_session_id TEXT,
  p_duration_minutes INTEGER DEFAULT 15
)
RETURNS BOOLEAN AS $$
DECLARE
  v_available INTEGER;
BEGIN
  -- Get available stock
  v_available := get_available_stock(p_product_id);

  -- Check if enough stock available
  IF v_available < p_quantity THEN
    RETURN FALSE;
  END IF;

  -- Create reservation
  INSERT INTO stock_reservations (product_id, quantity, session_id, expires_at)
  VALUES (
    p_product_id,
    p_quantity,
    p_session_id,
    NOW() + (p_duration_minutes || ' minutes')::INTERVAL
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to release reservation
CREATE OR REPLACE FUNCTION release_reservation(p_session_id TEXT)
RETURNS VOID AS $$
BEGIN
  DELETE FROM stock_reservations
  WHERE session_id = p_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired reservations
CREATE OR REPLACE FUNCTION cleanup_expired_reservations()
RETURNS INTEGER AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM stock_reservations
  WHERE expires_at <= NOW();

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
