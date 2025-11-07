# Supabase Database Setup - Quick Reference

## What You Need to Do in Supabase

### 1. ✅ Run the SQL Schema (REQUIRED)

Go to **SQL Editor** in your Supabase dashboard and run the complete SQL schema from `SUPABASE_SETUP.md` (Section 4).

This creates:
- ✅ `products` table - For your product inventory
- ✅ `orders` table - For customer orders
- ✅ `order_items` table - For order line items
- ✅ `wishlist` table - For customer wishlists
- ✅ All indexes, triggers, and RLS policies

**You can copy the entire SQL block from `SUPABASE_SETUP.md` and run it all at once.**

### 2. ✅ Enable Email Authentication (REQUIRED)

1. Go to **Authentication > Providers** in Supabase dashboard
2. Enable **"Email"** provider
3. Configure email settings (Supabase default works for development)

### 3. ✅ Create Admin User (REQUIRED)

**Option A: Via Supabase Dashboard**
1. Go to **Authentication > Users**
2. Click **"Add User"** > **"Create new user"**
3. Enter:
   - Email: `admin@azach.com` (or your preferred admin email)
   - Password: (create a strong password)
4. Click **"Create user"**

**Option B: Via App**
1. Navigate to `/register` in your app
2. Sign up with admin email (e.g., `admin@azach.com`)
3. Use this account for admin access

### 4. ✅ Set Environment Variables (REQUIRED)

Create `.env.local` in your project root:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Get these from: **Settings > API** in Supabase dashboard

### 5. ⚠️ Verify RLS Policies

After running the SQL, verify the policies are set correctly:

1. Go to **Authentication > Policies** (or check via SQL Editor)
2. You should see:
   - Products: Anyone can read, authenticated users can modify
   - Orders: Users can only see/modify their own
   - Wishlist: Users can only see/modify their own

### 6. 🧪 Test Your Setup

1. **Test Admin Login:**
   - Start your dev server: `npm run dev`
   - Navigate to `/login`
   - Login with admin credentials
   - Should redirect to `/admin`

2. **Test Product Management:**
   - Add a product in `/admin`
   - Verify it appears on homepage
   - Edit/delete functionality

3. **Test Customer Account:**
   - Create customer account at `/register`
   - Login at `/login`
   - Should redirect to `/account`

## Database Tables Summary

| Table | Purpose | Who Can Access |
|-------|---------|----------------|
| `products` | Product inventory | **Read:** Everyone<br>**Write:** Authenticated users (admin) |
| `orders` | Customer orders | **Read/Write:** Only their own orders |
| `order_items` | Order line items | **Read/Write:** Only their own order items |
| `wishlist` | Customer wishlist | **Read/Write:** Only their own wishlist |

## Important Notes

### RLS (Row Level Security)
- ✅ **Enabled** on all tables
- ✅ **Policies** are set to protect user data
- ✅ Products are **public read** but **authenticated write**
- ✅ Orders/Wishlist are **user-specific** (users only see their own)

### Authentication
- Uses Supabase's built-in `auth.users` table
- No need to create a separate users table
- User IDs are automatically available via `auth.uid()`

### Next Steps After Setup
1. Add products via `/admin` page
2. Test customer registration and login
3. (Optional) Connect Orders page to fetch real orders
4. (Optional) Connect Wishlist page to fetch real wishlist items

## Troubleshooting

### "relation does not exist" Error
- Make sure you ran the SQL schema in Supabase SQL Editor
- Check that all tables were created successfully

### "permission denied" or RLS Error
- Make sure you're logged in (authentication required)
- Check that RLS policies match your use case
- Verify user exists in Authentication > Users

### "Missing Supabase environment variables"
- Check `.env.local` exists in project root
- Verify variable names start with `VITE_`
- Restart dev server after creating/updating `.env.local`



