# Stripe Integration Setup Guide

## Overview
This guide will help you set up Stripe payments for your AZACH e-commerce store using Supabase Edge Functions (Approach 1: Supabase as single source of truth).

## Prerequisites
- Stripe account (create at https://stripe.com)
- Supabase project with CLI installed
- Products already set up in your Supabase database

---

## Step 1: Database Migration

Run the SQL migration to add Stripe fields to your orders table:

```bash
# In Supabase SQL Editor, run:
supabase_stripe_migration.sql
```

This adds:
- `stripe_session_id` - Tracks Stripe checkout session
- `stripe_payment_intent_id` - Tracks payment intent
- Indexes and unique constraints for data integrity

---

## Step 2: Get Stripe API Keys

1. Log in to your Stripe Dashboard: https://dashboard.stripe.com
2. Go to **Developers > API keys**
3. Copy your keys:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)

**Important:** Use **test keys** during development!

---

## Step 3: Configure Environment Variables

### Frontend (.env.local)

Add to your `.env.local` file:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

Restart your dev server after adding:
```bash
npm run dev
```

### Supabase Edge Functions

You need to set secrets in Supabase for the Edge Functions:

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project (replace with your project ID)
supabase link --project-ref your-project-ref

# Set secrets for Edge Functions
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_secret_key_here
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**To get your Supabase Service Role Key:**
- Go to Supabase Dashboard > Settings > API
- Copy the `service_role` key (keep this secret!)

---

## Step 4: Deploy Supabase Edge Functions

Deploy both Edge Functions to Supabase:

```bash
# Deploy create-checkout-session function
supabase functions deploy create-checkout-session

# Deploy stripe-webhook function
supabase functions deploy stripe-webhook
```

Verify deployment:
```bash
supabase functions list
```

---

## Step 5: Set Up Stripe Webhook

### Get Your Webhook URL

Your webhook URL will be:
```
https://your-project-ref.supabase.co/functions/v1/stripe-webhook
```

### Configure in Stripe Dashboard

1. Go to **Developers > Webhooks** in Stripe Dashboard
2. Click **Add endpoint**
3. Enter your webhook URL (from above)
4. Select events to listen for:
   - ✅ `checkout.session.completed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Update your Supabase secret:

```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_signing_secret
```

---

## Step 6: Test the Integration

### Test Mode (Recommended First)

1. Make sure you're using **test keys** (pk_test_ and sk_test_)
2. Add products to cart on your site
3. Click "Proceed to Checkout"
4. You'll be redirected to Stripe Checkout
5. Use Stripe test card:
   - Card number: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
6. Complete payment
7. You should be redirected to success page
8. Check Supabase `orders` and `order_items` tables for the new order

### Verify Webhook

1. Go to Stripe Dashboard > Developers > Webhooks
2. Click on your webhook endpoint
3. Check the "Recent events" - you should see `checkout.session.completed`
4. If it shows errors, check the logs

---

## Step 7: Monitor and Debug

### Check Edge Function Logs

```bash
# View logs for create-checkout-session
supabase functions logs create-checkout-session

# View logs for stripe-webhook
supabase functions logs stripe-webhook
```

### Common Issues

**Issue: "Missing Stripe environment variables"**
- Make sure you set all secrets in Step 3
- Redeploy functions after setting secrets

**Issue: Webhook not receiving events**
- Verify webhook URL is correct
- Check webhook signing secret matches
- Ensure webhook is set to listen for `checkout.session.completed`

**Issue: Orders not created**
- Check webhook logs in Stripe Dashboard
- Verify Supabase service role key is correct
- Check RLS policies on `orders` and `order_items` tables

**Issue: "Stripe failed to load"**
- Verify `VITE_STRIPE_PUBLISHABLE_KEY` is in `.env.local`
- Restart dev server
- Check browser console for errors

---

## Step 8: Go Live (Production)

When ready for production:

1. **Switch to Live Keys:**
   - Get live keys from Stripe Dashboard (pk_live_ and sk_live_)
   - Update `.env.local` with live publishable key
   - Update Supabase secrets with live secret key

2. **Update Webhook:**
   - Create a new webhook endpoint in Stripe (live mode)
   - Use the same URL
   - Update `STRIPE_WEBHOOK_SECRET` with new signing secret

3. **Test thoroughly:**
   - Use real card with small amount
   - Verify order creation
   - Check inventory updates

4. **Enable Production Features:**
   - Set up email confirmations
   - Configure Stripe receipts
   - Add order tracking

---

## Payment Flow Summary

1. **Customer adds items to cart** → Stored in React Context
2. **Customer clicks checkout** → Navigates to `/checkout`
3. **Frontend calls Edge Function** → `create-checkout-session`
4. **Edge Function creates Stripe session** → Returns session ID
5. **Customer redirected to Stripe** → Enters payment info
6. **Customer completes payment** → Stripe processes payment
7. **Stripe sends webhook** → `checkout.session.completed` event
8. **Webhook creates order** → Saves to Supabase `orders` and `order_items`
9. **Webhook updates inventory** → Decreases product stock
10. **Customer redirected back** → Success page with order confirmation

---

## Security Notes

- ✅ Never expose secret keys in frontend code
- ✅ Always verify webhook signatures
- ✅ Use HTTPS in production
- ✅ Keep service role key secure
- ✅ Use test mode during development
- ✅ Validate all data on the backend (Edge Functions)

---

## Files Created

### Frontend
- `src/lib/stripe.ts` - Stripe client configuration
- `src/pages/Checkout.tsx` - Checkout page
- `src/pages/CheckoutSuccess.tsx` - Success page

### Backend (Supabase Edge Functions)
- `supabase/functions/create-checkout-session/index.ts` - Creates checkout session
- `supabase/functions/stripe-webhook/index.ts` - Handles payment webhooks

### Database
- `supabase_stripe_migration.sql` - Database schema updates

---

## Next Steps

1. ✅ Set up email confirmations (using Supabase Auth emails or SendGrid)
2. ✅ Implement order tracking page
3. ✅ Add shipping address collection
4. ✅ Set up abandoned cart recovery
5. ✅ Add refund functionality for admins
6. ✅ Implement subscription products (if needed)

---

## Support Resources

- Stripe Documentation: https://stripe.com/docs
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Stripe Testing: https://stripe.com/docs/testing

Need help? Check:
1. Edge Function logs: `supabase functions logs <function-name>`
2. Stripe Dashboard webhook logs
3. Browser console for frontend errors
