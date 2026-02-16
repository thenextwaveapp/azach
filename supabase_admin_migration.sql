-- Admin Users Migration
-- Adds admin role system to the database

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Only admins can view admin_users table
DROP POLICY IF EXISTS "Admins can view admin_users" ON admin_users;
CREATE POLICY "Admins can view admin_users"
  ON admin_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Only admins can insert new admins
DROP POLICY IF EXISTS "Admins can insert admin_users" ON admin_users;
CREATE POLICY "Admins can insert admin_users"
  ON admin_users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Only admins can delete admins
DROP POLICY IF EXISTS "Admins can delete admin_users" ON admin_users;
CREATE POLICY "Admins can delete admin_users"
  ON admin_users FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Update products RLS policies to only allow admins to modify

DROP POLICY IF EXISTS "Only authenticated users can insert products" ON products;
CREATE POLICY "Only admins can insert products"
  ON products FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Only authenticated users can update products" ON products;
CREATE POLICY "Only admins can update products"
  ON products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Only authenticated users can delete products" ON products;
CREATE POLICY "Only admins can delete products"
  ON products FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Create a function to check if a user is an admin (useful for other tables/functions)
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- INSERT YOUR ADMIN EMAIL HERE
-- After running this migration, manually add your first admin:
-- INSERT INTO admin_users (user_id)
-- SELECT id FROM auth.users WHERE email = 'admin@azach.com';
