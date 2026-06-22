# Paystack & DHL Express Integration Setup Guide

This guide walks you through setting up Paystack payment processing and DHL Express shipping for your Nigerian e-commerce platform.

## Table of Contents

1. [Overview](#overview)
2. [Database Migrations](#database-migrations)
3. [Paystack Configuration](#paystack-configuration)
4. [DHL Express Configuration](#dhl-express-configuration)
5. [Environment Variables](#environment-variables)
6. [Deploy Edge Functions](#deploy-edge-functions)
7. [Testing](#testing)
8. [Production Deployment](#production-deployment)
9. [Troubleshooting](#troubleshooting)

---

## Overview

### What's Changed

- **Payment Gateway**: Migrated from Stripe to Paystack for better Nigerian market support
- **Shipping**: Integrated DHL Express API for real-time shipping rates from Nigeria
- **Currency**: Changed base currency from CAD to NGN (Nigerian Naira)
- **Product Data**: Added weight and dimensions for accurate shipping calculations

### Architecture

```
Frontend (React + TypeScript)
    ↓
Supabase Edge Functions
    ↓
├── Paystack API (Payment Processing)
└── DHL Express API (Shipping Rates & Tracking)
    ↓
Supabase Database (Orders, Products, Stock)
```

---

## Database Migrations

### 1. Run Migrations

Navigate to your project root and run the migrations in order:

```bash
# If using Supabase CLI
supabase db push

# Or manually run each migration via Supabase Dashboard > SQL Editor
```

### Migration Files (in order)

1. `001_add_shipping_fields.sql` - Adds weight/dimensions to products
2. `002_paystack_orders.sql` - Adds Paystack payment fields to orders
3. `003_shipping_cache.sql` - Creates shipping rate cache table
4. `004_cad_to_ngn_prices.sql` - Converts prices from CAD to NGN

### 2. Verify Migrations

After running migrations, verify the changes:

```sql
-- Check product schema
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'products'
AND column_name IN ('weight_kg', 'length_cm', 'width_cm', 'height_cm');

-- Check orders schema
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'orders'
AND column_name IN ('paystack_reference', 'payment_provider', 'dhl_tracking_number');

-- Verify price migration
SELECT * FROM price_migrations ORDER BY migration_date DESC LIMIT 1;

-- Sample product prices after migration
SELECT id, name, price FROM products LIMIT 5;
```

### 3. Backfill Product Shipping Data

Update existing products with shipping information:

```sql
-- Set default weights based on categories (adjust as needed)
UPDATE products SET weight_kg = 0.5 WHERE category = 'accessories';
UPDATE products SET weight_kg = 1.0 WHERE category = 'clothing';
UPDATE products SET weight_kg = 0.8 WHERE category = 'footwear';

-- Or update individual products
UPDATE products
SET
  weight_kg = 0.75,
  length_cm = 30,
  width_cm = 25,
  height_cm = 10
WHERE id = 'your-product-id';
```

---

## Paystack Configuration

### 1. Create Paystack Account

1. Go to [https://paystack.com](https://paystack.com)
2. Sign up for a business account
3. Complete KYC verification (required for live payments)
4. Activate your account

### 2. Get API Keys

1. Log in to Paystack Dashboard
2. Go to **Settings > API Keys & Webhooks**
3. Copy your keys:
   - **Test Public Key**: `pk_test_...`
   - **Test Secret Key**: `sk_test_...`
   - (Later: Live keys after going live)

### 3. Configure Webhook

1. In Paystack Dashboard, go to **Settings > API Keys & Webhooks**
2. Click **Add Webhook**
3. Set Webhook URL:
   ```
   https://your-project.supabase.co/functions/v1/paystack-webhook
   ```
4. Subscribe to events:
   - ✅ `charge.success`
5. Save webhook
6. Copy the webhook secret (not needed for Paystack, but good to note)

### 4. Test Cards

For testing in test mode, use Paystack's test cards:

| Card Number         | CVV | Expiry     | PIN  | Result  |
| ------------------- | --- | ---------- | ---- | ------- |
| 5060666666666666666 | 123 | 12/30      | 1234 | Success |
| 408 408 408 408 408 1 | 408 | 12/30    | 0000 | Decline |

More test cards: https://paystack.com/docs/payments/test-payments/

---

## DHL Express Configuration

### 1. Get DHL Express Account

1. Contact DHL Express Nigeria: https://www.dhl.com/ng-en/home/express.html
2. Request a shipper account number
3. Get account manager contact for API access

### 2. Register for DHL Developer Access

1. Go to [https://developer.dhl.com](https://developer.dhl.com)
2. Create an account
3. Create a new app
4. Subscribe to **DHL Express MyDHL API**
5. Get credentials:
   - **API Key**
   - **API Secret**

### 3. DHL Sandbox Testing

DHL provides a sandbox environment for testing:

- **Sandbox URL**: `https://express.api.dhl.com/mydhlapi/test/rates`
- Use sandbox credentials during development
- Switch to production URL and credentials when going live

### 4. Shipping Origin Setup

Set your primary shipping location (Lagos example):

```env
DHL_ORIGIN_POSTAL_CODE=100001
DHL_ORIGIN_CITY=Lagos
DHL_ORIGIN_COUNTRY=NG
```

---

## Environment Variables

### 1. Copy Example File

```bash
cp .env.example .env.local
```

### 2. Fill in Your Values

Edit `.env.local` with your actual credentials:

```env
# Supabase
VITE_SUPABASE_URL=https://oomypczpxxpechltrqmq.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Paystack (use test keys first)
VITE_PAYMENT_PROVIDER=paystack
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
PAYSTACK_SECRET_KEY=sk_test_xxxxx

# DHL Express
DHL_API_KEY=your_dhl_api_key
DHL_API_SECRET=your_dhl_api_secret
DHL_ACCOUNT_NUMBER=your_account_number
DHL_ORIGIN_POSTAL_CODE=100001
DHL_ORIGIN_CITY=Lagos
```

### 3. Add to Supabase Edge Functions

Environment variables for Edge Functions must be set in Supabase:

```bash
# Using Supabase CLI
supabase secrets set PAYSTACK_SECRET_KEY=sk_test_xxxxx
supabase secrets set DHL_API_KEY=your_key
supabase secrets set DHL_API_SECRET=your_secret
supabase secrets set DHL_ACCOUNT_NUMBER=your_account
supabase secrets set DHL_ORIGIN_POSTAL_CODE=100001
supabase secrets set DHL_ORIGIN_CITY=Lagos

# Or via Supabase Dashboard:
# Settings > Edge Functions > Add Secret
```

---

## Deploy Edge Functions

### 1. Deploy Paystack Functions

```bash
# Deploy Paystack initialize function
supabase functions deploy paystack-initialize

# Deploy Paystack webhook
supabase functions deploy paystack-webhook

# Deploy DHL rates function
supabase functions deploy dhl-get-rates
```

### 2. Verify Deployment

```bash
# List deployed functions
supabase functions list

# Test function (example)
curl -i --location --request POST \
  'https://your-project.supabase.co/functions/v1/dhl-get-rates' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"destinationCountry":"US","items":[{"id":"test-id","quantity":1}]}'
```

### 3. Monitor Function Logs

```bash
# View real-time logs
supabase functions logs paystack-webhook

# Or via Supabase Dashboard:
# Edge Functions > Select function > Logs
```

---

## Testing

### Complete Checkout Flow Test

1. **Add Products to Cart**
   - Go to your site
   - Add 2-3 products to cart

2. **View Shipping Rates**
   - Enter destination country in checkout
   - Verify DHL rates are fetched and displayed
   - Check console for any errors

3. **Complete Payment**
   - Click "Pay with Paystack"
   - Use test card: `5060666666666666666`, CVV: `123`, Expiry: `12/30`, PIN: `1234`
   - Complete payment

4. **Verify Order Creation**
   ```sql
   -- Check latest order
   SELECT * FROM orders ORDER BY created_at DESC LIMIT 1;

   -- Check order items
   SELECT * FROM order_items WHERE order_id = 'your-order-id';

   -- Check stock was reduced
   SELECT id, name, stock FROM products WHERE id IN ('product-ids');
   ```

5. **Check Webhook Logs**
   - Supabase Dashboard > Edge Functions > paystack-webhook > Logs
   - Verify webhook was received and processed

### Test Cases Checklist

- [ ] DHL rates calculation for domestic (Nigeria)
- [ ] DHL rates calculation for international (US, UK, Canada)
- [ ] Paystack payment success
- [ ] Paystack payment decline
- [ ] Stock reservation during checkout
- [ ] Stock deduction after payment
- [ ] Order creation with correct data
- [ ] Multiple currency display (NGN, USD, CAD)
- [ ] Cache for shipping rates (check for fast repeat lookups)

---

## Production Deployment

### Pre-Launch Checklist

- [ ] All migrations run successfully
- [ ] Paystack live keys obtained and verified
- [ ] DHL production credentials configured
- [ ] All products have weight/dimensions set
- [ ] Test order completed end-to-end
- [ ] Webhook URL verified in Paystack
- [ ] Environment variables set for production
- [ ] Error monitoring configured (Sentry, etc.)

### Switch to Live Mode

1. **Update Environment Variables**

   ```env
   VITE_PAYMENT_PROVIDER=paystack
   VITE_PAYSTACK_PUBLIC_KEY=pk_live_xxxxx
   PAYSTACK_SECRET_KEY=sk_live_xxxxx
   DHL_API_KEY=production_key
   DHL_API_SECRET=production_secret
   VITE_ENVIRONMENT=production
   ```

2. **Update Supabase Secrets**

   ```bash
   supabase secrets set PAYSTACK_SECRET_KEY=sk_live_xxxxx
   supabase secrets set DHL_API_KEY=production_key
   # ... etc
   ```

3. **Update Paystack Webhook URL**

   - Update webhook URL to production domain
   - Re-verify webhook is working with a test transaction

4. **Monitor First Live Transaction**

   - Process a small test order ($1-5)
   - Verify payment, webhook, and order creation
   - Check DHL rate calculation
   - Monitor logs for any errors

---

## Troubleshooting

### Paystack Issues

**Issue**: Payment popup not opening

- ✅ Check Paystack Inline JS is loaded
- ✅ Verify public key is correct
- ✅ Check browser console for errors
- ✅ Ensure popup blockers are disabled

**Issue**: Webhook not received

- ✅ Verify webhook URL in Paystack dashboard
- ✅ Check Edge Function logs for incoming requests
- ✅ Ensure webhook subscribed to `charge.success`
- ✅ Test webhook URL is accessible publicly

**Issue**: Order not created after payment

- ✅ Check Edge Function logs for errors
- ✅ Verify metadata is being passed correctly
- ✅ Check stock reservation hasn't expired
- ✅ Verify database permissions for service role

### DHL Issues

**Issue**: No shipping rates returned

- ✅ Verify DHL credentials are correct
- ✅ Check products have weight/dimensions set
- ✅ Ensure destination country code is valid (2-letter ISO)
- ✅ Check Edge Function logs for DHL API errors
- ✅ Verify DHL account is active and has funds

**Issue**: Incorrect shipping rates

- ✅ Check product weights are accurate
- ✅ Verify origin postal code is correct
- ✅ Ensure exchange rate (USD to NGN) is up to date
- ✅ Test with DHL sandbox first

**Issue**: Cache not working

- ✅ Check shipping_rate_cache table exists
- ✅ Verify RLS policies allow insert/select
- ✅ Check cache expiry time (30 minutes default)
- ✅ Monitor cache hit rate in logs

### Currency Issues

**Issue**: Prices still showing in CAD

- ✅ Verify migration 004 ran successfully
- ✅ Check CurrencyContext is using NGN as base
- ✅ Clear browser localStorage and cache
- ✅ Verify exchange rates are loading

**Issue**: Wrong currency symbol

- ✅ Check CURRENCY_SYMBOLS mapping in CurrencyContext
- ✅ Verify selected currency in localStorage
- ✅ Test with different currencies

---

## Additional Resources

### Documentation Links

- [Paystack API Docs](https://paystack.com/docs/api/)
- [DHL Express API Docs](https://developer.dhl.com/api-reference/mydhl-api-dhl-express)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

### Support Contacts

- **Paystack Support**: support@paystack.com
- **DHL Developer Support**: https://developer.dhl.com/support
- **Supabase Discord**: https://discord.supabase.com

---

## Next Steps

After successful setup:

1. **Monitor Performance**
   - Track payment success rates
   - Monitor DHL API response times
   - Check shipping rate accuracy

2. **Optimize**
   - Tune cache duration for shipping rates
   - Add more specific product categories
   - Implement DHL shipment creation (Phase 4)

3. **Enhance**
   - Add more payment methods (Bank Transfer, USSD)
   - Integrate local Nigerian couriers
   - Implement automated tracking updates

4. **Scale**
   - Negotiate volume discounts with DHL
   - Add multi-warehouse support
   - Implement pickup points

---

**Questions or issues?** Check the troubleshooting section or create an issue in the project repository.
