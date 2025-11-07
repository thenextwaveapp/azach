# Supabase Integration Setup Guide

## Overview
Your AZACH e-commerce site is now fully integrated with Supabase for inventory management. All product data is now stored in Supabase and can be managed through the admin interface.

## Setup Steps

### 1. Install Dependencies
```bash
npm install @supabase/supabase-js
```

### 2. Create Supabase Project
1. Go to https://supabase.com
2. Create a new project
3. Note your project URL and anon key from Settings > API

### 3. Set Up Environment Variables
Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Create Database Schema

**Option A: Safe Setup (Recommended if you have existing data)**
Use `supabase_schema.sql` - This file handles existing tables gracefully and won't cause errors.

**Option B: Clean Setup (Use if starting fresh or want to reset)**
Use `supabase_schema_clean.sql` - This will DROP all existing tables and recreate them. **WARNING: This deletes all data!**

**Option C: Manual Setup**
Run the following SQL in your Supabase SQL Editor (you can run it all at once or in sections):

**Note:** If you get "relation already exists" errors, you can either:
1. Use the `supabase_schema.sql` file (handles existing tables)
2. Or manually skip the CREATE TABLE statements for tables that already exist

```sql
-- Create products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  image_urls TEXT[],
  sku TEXT UNIQUE,
  stock INTEGER DEFAULT 0 NOT NULL,
  in_stock BOOLEAN DEFAULT true NOT NULL,
  featured BOOLEAN DEFAULT false,
  on_sale BOOLEAN DEFAULT false,
  gender TEXT CHECK (gender IN ('men', 'women', 'unisex')),
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_gender ON products(gender);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_on_sale ON products(on_sale);
CREATE INDEX idx_products_in_stock ON products(in_stock);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read products
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (true);

-- Policy: Only authenticated users can insert
CREATE POLICY "Only authenticated users can insert products"
  ON products FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Only authenticated users can update
CREATE POLICY "Only authenticated users can update products"
  ON products FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Policy: Only authenticated users can delete
CREATE POLICY "Only authenticated users can delete products"
  ON products FOR DELETE
  USING (auth.role() = 'authenticated');

-- Create orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  shipping_address JSONB,
  billing_address JSONB,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wishlist table
CREATE TABLE wishlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Create indexes for orders
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Create indexes for order_items
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Create indexes for wishlist
CREATE INDEX idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX idx_wishlist_product_id ON wishlist(product_id);

-- Create trigger for orders updated_at
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security for orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own orders
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create their own orders
CREATE POLICY "Users can create their own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own orders (limited)
CREATE POLICY "Users can update their own orders"
  ON orders FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Enable Row Level Security for order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view order items for their orders
CREATE POLICY "Users can view their order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Policy: Users can create order items for their orders
CREATE POLICY "Users can create their own order items"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Enable Row Level Security for wishlist
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own wishlist
CREATE POLICY "Users can view their own wishlist"
  ON wishlist FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can add to their own wishlist
CREATE POLICY "Users can add to their own wishlist"
  ON wishlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can remove from their own wishlist
CREATE POLICY "Users can delete from their own wishlist"
  ON wishlist FOR DELETE
  USING (auth.uid() = user_id);
```

### 5. Set Up Authentication

#### Enable Email Authentication in Supabase:
1. Go to Authentication > Providers in your Supabase dashboard
2. Enable "Email" provider
3. Configure email settings (you can use Supabase's default emails for development)

#### Create Admin User:
1. Go to Authentication > Users in Supabase dashboard
2. Click "Add User" > "Create new user"
3. Enter admin email and password
4. Click "Create user"

**OR** create the user through the app:
1. Navigate to `/login` in your app
2. The app will automatically create the user on first signup
3. You can then use this account to log in

**Note:** For production, consider:
- Using Supabase's built-in email verification
- Setting up custom SMTP for email sending
- Implementing role-based access control (RBAC) for more granular permissions
- Adding MFA (Multi-Factor Authentication) for admin accounts

### 6. Access Admin Interface

1. **Login First**: Navigate to `/login` and sign in with your admin credentials
2. **Access Admin Panel**: After logging in, navigate to `/admin` or use the "Admin Panel" link in the account dropdown
3. **Manage Products**:
   - View all products in a table
   - Add new products with the "Add Product" button
   - Edit existing products by clicking the edit icon
   - Delete products by clicking the trash icon
   - Manage stock levels and product status

**Security Note**: The admin route is protected - only authenticated users can access it. Unauthenticated users will be redirected to the login page.

## File Structure

### New Files Created:
- `src/lib/supabase.ts` - Supabase client configuration
- `src/types/product.ts` - TypeScript type definitions
- `src/services/productService.ts` - Product CRUD operations
- `src/hooks/useProducts.ts` - React Query hooks for products
- `src/pages/Admin.tsx` - Admin/inventory management page
- `src/pages/Login.tsx` - Admin login page
- `src/contexts/AuthContext.tsx` - Authentication context for Supabase Auth
- `src/components/ProtectedRoute.tsx` - Route protection component
- `src/utils/productHelpers.ts` - Helper functions for product conversion

### Updated Files:
- `src/pages/Index.tsx` - Now uses Supabase for featured products
- `src/pages/NewArrivals.tsx` - Now uses Supabase for all products
- `src/pages/Women.tsx` - Now uses Supabase for women's products
- `src/pages/Men.tsx` - Now uses Supabase for men's products
- `src/pages/Sale.tsx` - Now uses Supabase for sale products
- `src/components/SearchDialog.tsx` - Now uses Supabase for search
- `src/components/ProductCard.tsx` - Updated to handle string IDs
- `src/components/AccountDropdown.tsx` - Updated to use auth context and show admin panel link
- `src/contexts/CartContext.tsx` - Updated to handle string IDs
- `src/App.tsx` - Added AuthProvider, Login route, and protected Admin route

## Features

### Product Management
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Stock management
- ✅ Featured products
- ✅ Sale products
- ✅ Gender-based filtering
- ✅ Category management
- ✅ Search functionality

### Admin Interface
- ✅ Product table with all details
- ✅ Add/Edit product dialog
- ✅ Delete with confirmation
- ✅ Stock status indicators
- ✅ Real-time updates via React Query

## Database Tables Overview

### Products Table
- Stores all product information
- Anyone can read (public)
- Only authenticated users can modify (admin)

### Orders Table
- Stores customer orders
- Users can only see/modify their own orders
- Links to `order_items` for order line items

### Order Items Table
- Stores individual items in each order
- References products and orders
- Users can only see items from their own orders

### Wishlist Table
- Stores customer wishlist items
- Users can only see/modify their own wishlist
- Prevents duplicate items (unique constraint)

## Next Steps

1. **Seed Initial Data**: Add your initial products through the admin interface or directly in Supabase
2. **Set Up Authentication**: Enable Email authentication in Supabase dashboard
3. **Create Admin User**: Create an admin user in Supabase Authentication > Users
4. **Test the System**: 
   - Login as admin and add some products
   - Create a customer account
   - Browse products and add to cart
   - Test wishlist functionality (when implemented)
5. **Image Upload**: Consider integrating Supabase Storage for product images
6. **Orders Integration**: Connect the Orders page to fetch from Supabase
7. **Wishlist Integration**: Connect the Wishlist page to fetch from Supabase

## Troubleshooting

### "Missing Supabase environment variables" Error
- Make sure `.env.local` exists in the root directory
- Check that variable names start with `VITE_`
- Restart your dev server after creating/updating `.env.local`

### RLS Policy Errors / Authentication Issues

**Problem**: "new row violates row-level security policy" or "permission denied"

**Solutions**:
1. **Make sure you're logged in**: Navigate to `/login` and sign in before accessing `/admin`
2. **Check user exists**: Ensure your admin user exists in Supabase Authentication > Users
3. **Verify RLS policies**: The policies require authenticated users - make sure you're signed in
4. **For development only** (not recommended for production):
   ```sql
   -- Temporarily disable RLS for testing
   ALTER TABLE products DISABLE ROW LEVEL SECURITY;
   ```
   Or allow anonymous access:
   ```sql
   -- Allow anyone to insert/update/delete (NOT FOR PRODUCTION!)
   DROP POLICY "Only authenticated users can insert products" ON products;
   CREATE POLICY "Anyone can insert products" ON products FOR INSERT WITH CHECK (true);
   -- Repeat for UPDATE and DELETE
   ```

**Best Practice**: Always use authentication in production. The RLS policies ensure only logged-in users can modify products.

### Products Not Showing
- Check that products exist in Supabase
- Verify `featured`, `on_sale`, `in_stock`, and `gender` fields are set correctly
- Check browser console for errors

