# DHL Label Printing & Tracking Setup Guide

This guide covers the implementation of DHL shipment creation, label printing, tracking, and address validation APIs.

## What's Been Implemented

### ✅ Completed

1. **DHL Shipment Creation API** (`supabase/functions/dhl-create-shipment`)
   - Creates DHL shipments via POST /shipments
   - Generates shipping labels (PDF format)
   - Returns tracking number and shipment ID
   - Stores labels in Supabase Storage
   - Automatically updates order records

2. **DHL Tracking API** (`supabase/functions/dhl-track-shipment`)
   - Tracks shipments via GET /shipments/{trackingNumber}/tracking
   - Returns real-time status updates
   - Provides delivery timeline and location history
   - Shows current shipment location

3. **DHL Address Validation API** (`supabase/functions/dhl-validate-address`)
   - Validates addresses via GET /address-validate
   - Checks if DHL can service the address
   - Returns address suggestions if available
   - Prevents failed deliveries

4. **Frontend DHL Library Updates** (`src/lib/dhl.ts`)
   - Added `createDHLShipment()` function
   - Updated `trackDHLShipment()` function
   - Added `validateDHLAddress()` function
   - Full TypeScript types for all APIs

5. **Admin UI Enhancements** (`src/pages/OrdersAdmin.tsx`)
   - "Create DHL Shipment" button
   - Automatic label generation
   - Displays tracking number and shipment status
   - Download/view generated labels
   - Read-only fields for API-generated data

### ⏳ Pending (Optional Enhancements)

6. **Customer Order Tracking Page** (Task #5)
   - Public tracking page for customers
   - Real-time shipment status display
   - Delivery timeline visualization

7. **Checkout Address Validation** (Task #6)
   - Validate addresses during checkout
   - Warn customers about unserviceable addresses
   - Reduce failed deliveries

---

## Prerequisites

1. **DHL Express Account**
   - Active DHL Express business account
   - Account number
   - Shipping address configured

2. **DHL Developer Access**
   - API Key and API Secret from https://developer.dhl.com
   - Subscribed to "MyDHL API" (Express)

3. **Supabase Storage**
   - Storage bucket for shipping labels
   - Public access configured

---

## Setup Instructions

### Step 1: Create Supabase Storage Bucket

1. Go to Supabase Dashboard > Storage
2. Create a new bucket named `shipping-labels`
3. Set bucket as **Public**
4. Add policy to allow service role to upload:

```sql
-- Allow service role to upload labels
CREATE POLICY "Service role can upload labels"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'shipping-labels');

-- Allow public to read labels (for viewing/printing)
CREATE POLICY "Public can view labels"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'shipping-labels');
```

### Step 2: Configure Environment Variables

Add these environment variables to your Supabase Edge Functions:

```bash
# DHL API Credentials
DHL_API_KEY=your_dhl_api_key
DHL_API_SECRET=your_dhl_api_secret
DHL_ACCOUNT_NUMBER=your_dhl_account_number

# DHL API URL (use test for sandbox, remove /test for production)
DHL_API_URL=https://express.api.dhl.com/mydhlapi/test

# Your shipping origin details (Nigeria)
DHL_ORIGIN_POSTAL_CODE=100001
DHL_ORIGIN_CITY=Lagos
DHL_ORIGIN_ADDRESS=Your Business Address Here
DHL_ORIGIN_EMAIL=shipping@yourdomain.com
DHL_ORIGIN_PHONE=+234XXXXXXXXXX
DHL_COMPANY_NAME=Your Company Name
DHL_SHIPPER_NAME=Your Shipper Name

# Supabase (already configured)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Set via CLI:**
```bash
supabase secrets set DHL_API_KEY=your_key
supabase secrets set DHL_API_SECRET=your_secret
supabase secrets set DHL_ACCOUNT_NUMBER=your_account
supabase secrets set DHL_API_URL=https://express.api.dhl.com/mydhlapi/test
supabase secrets set DHL_ORIGIN_POSTAL_CODE=100001
supabase secrets set DHL_ORIGIN_CITY=Lagos
supabase secrets set DHL_ORIGIN_ADDRESS="Your Address"
supabase secrets set DHL_ORIGIN_EMAIL=shipping@domain.com
supabase secrets set DHL_ORIGIN_PHONE="+234XXXXXXXXXX"
supabase secrets set DHL_COMPANY_NAME="Your Company"
supabase secrets set DHL_SHIPPER_NAME="Your Shipper"
```

**Or via Supabase Dashboard:**
- Settings > Edge Functions > Secrets > Add Secret

### Step 3: Deploy Edge Functions

Deploy the new edge functions:

```bash
# Deploy shipment creation
supabase functions deploy dhl-create-shipment

# Deploy tracking
supabase functions deploy dhl-track-shipment

# Deploy address validation
supabase functions deploy dhl-validate-address
```

### Step 4: Verify Deployment

Test each function:

```bash
# Test shipment creation (replace with real order ID)
curl -i --location --request POST \
  'https://your-project.supabase.co/functions/v1/dhl-create-shipment' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"orderId":"test-order-id"}'

# Test tracking (replace with real tracking number)
curl -i --location --request POST \
  'https://your-project.supabase.co/functions/v1/dhl-track-shipment' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"trackingNumber":"1234567890"}'

# Test address validation
curl -i --location --request POST \
  'https://your-project.supabase.co/functions/v1/dhl-validate-address' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"countryCode":"US","postalCode":"10001","cityName":"New York"}'
```

---

## Usage Guide

### Admin Workflow: Creating Shipments

1. **Go to Orders Admin** (`/admin/orders`)
2. **Click on an order** to view details
3. **Check payment status** - ensure order is paid
4. **Click "Create DHL Shipment"** button
5. **Wait for confirmation** - shipment created in ~2-5 seconds
6. **Label generated automatically**:
   - Tracking number populated
   - Shipment ID populated
   - Label URL populated
7. **Download/Print label** - click external link icon
8. **Label also appears in MyDHL+ portal**

### Admin Workflow: Manual Override

If you need to manually enter shipping info (not recommended):
- Fields become editable if no shipment has been created
- Enter tracking number, shipment ID, and label URL manually
- Click "Update Shipping Information"

### Tracking Shipments

**Admin:**
- View order details in Orders Admin
- Tracking number is displayed
- Click tracking number to view in MyDHL+

**Customer (when implemented):**
- Will have dedicated tracking page
- Enter tracking number to see status

---

## API Details

### POST /shipments (Create Shipment)

**Request:**
```json
{
  "orderId": "uuid-of-order"
}
```

**Response:**
```json
{
  "success": true,
  "trackingNumber": "1234567890",
  "shipmentId": "1234567890",
  "labelUrl": "https://storage.supabase.co/...",
  "labelBase64": "base64_pdf_data",
  "waybillBase64": "base64_pdf_data"
}
```

**What it does:**
1. Fetches order details (customer, items, address)
2. Calculates package weight and dimensions
3. Prepares customs declaration for international shipments
4. Calls DHL API to create shipment
5. Receives label PDF (Base64)
6. Uploads label to Supabase Storage
7. Updates order with tracking info
8. Returns tracking number and label URL

### GET /tracking (Track Shipment)

**Request:**
```json
{
  "trackingNumber": "1234567890"
}
```

**Response:**
```json
{
  "trackingNumber": "1234567890",
  "status": "in_transit",
  "statusDescription": "Shipment picked up",
  "estimatedDelivery": "2026-06-30",
  "origin": "Lagos",
  "destination": "New York",
  "currentLocation": "Dubai",
  "events": [
    {
      "timestamp": "2026-06-26T10:30:00Z",
      "location": "Dubai",
      "description": "In transit",
      "statusCode": "PU",
      "serviceArea": "Middle East Hub"
    }
  ],
  "shipmentDetails": {
    "service": "EXPRESS WORLDWIDE",
    "totalWeight": 2.5,
    "numberOfPieces": 1
  }
}
```

### GET /address-validate (Validate Address)

**Request:**
```json
{
  "type": "delivery",
  "countryCode": "US",
  "postalCode": "10001",
  "cityName": "New York",
  "addressLine1": "123 Main St"
}
```

**Response:**
```json
{
  "valid": true,
  "serviceable": true,
  "warnings": [],
  "suggestedAddress": {
    "addressLine1": "123 MAIN ST",
    "cityName": "NEW YORK",
    "postalCode": "10001",
    "countryCode": "US"
  }
}
```

---

## Testing

### Sandbox Testing

The implementation uses DHL's test endpoint by default:
```
https://express.api.dhl.com/mydhlapi/test/shipments
```

**Test Mode Features:**
- No actual shipments created
- No charges incurred
- Returns realistic test data
- Labels are generated but marked "TEST"

**Test Workflow:**
1. Create a real order on your site
2. Use "Create DHL Shipment" in admin
3. Verify label is generated with "TEST" watermark
4. Check tracking returns test data
5. Verify shipment appears in MyDHL+ (test mode)

### Production Deployment

When ready for production:

1. **Update API URL** in environment variables:
```bash
supabase secrets set DHL_API_URL=https://express.api.dhl.com/mydhlapi
```
(Remove `/test` from URL)

2. **Verify DHL account has funds** - production shipments cost money

3. **Test with small order** first

4. **Monitor Edge Function logs** for errors

---

## Troubleshooting

### "DHL API credentials not configured"

**Issue**: Environment variables not set
**Fix**: Run `supabase secrets list` and verify all DHL_* variables are set

### "Order not found"

**Issue**: Invalid order ID or order doesn't exist
**Fix**: Verify order exists in database

### "Shipment already created for this order"

**Issue**: Trying to create duplicate shipment
**Fix**: This is expected - each order can only have one shipment

### "Failed to upload label"

**Issue**: Supabase Storage bucket not created or permissions incorrect
**Fix**: Create `shipping-labels` bucket and add policies (see Step 1)

### "Address not found in DHL database"

**Issue**: Address validation failed
**Fix**: This is a warning - address might still be serviceable. Verify with customer.

### Labels not appearing in MyDHL+

**Issue**: Using test endpoint
**Fix**: Test shipments appear in test view of MyDHL+. Switch to production URL for real shipments.

---

## Cost Considerations

### DHL API Costs

- **Rate API**: FREE (unlimited calls)
- **Shipment Creation**: Charged per shipment (based on your DHL rate card)
- **Tracking API**: FREE (unlimited calls)
- **Address Validation**: FREE (unlimited calls)

**Cost Control:**
- Only create shipments for paid orders
- Use rate caching to minimize API calls
- Test thoroughly in sandbox before production

### Supabase Costs

- **Storage**: ~$0.021/GB/month for label PDFs
- **Edge Functions**: Included in free tier (up to 500K invocations/month)
- **Bandwidth**: ~$0.09/GB for label downloads

**Typical Usage:**
- 1 label PDF = ~50KB
- 1000 orders/month = ~50MB storage = ~$0.001/month
- Negligible cost for most businesses

---

## Next Steps

### Immediate
1. Deploy edge functions
2. Test in sandbox mode
3. Create test shipments
4. Verify labels print correctly

### Soon
5. Switch to production DHL API
6. Implement customer tracking page (Task #5)
7. Add checkout address validation (Task #6)

### Optional Enhancements
8. Automated pickup scheduling via DHL Pickup API
9. Bulk shipment creation
10. Email notifications with tracking links
11. Webhook for delivery status updates
12. Integrate proof of delivery retrieval

---

## Support

**DHL Developer Support**: https://developer.dhl.com/support
**Supabase Support**: https://discord.supabase.com
**Project Issues**: Create issue in your repository

---

## Summary

You now have:
- ✅ Automated DHL shipment creation
- ✅ Label generation (PDF)
- ✅ Real-time tracking
- ✅ Address validation
- ✅ MyDHL+ portal integration
- ✅ Admin UI for shipment management

**No more manual label creation!** 🎉

The system automatically creates DHL shipments, generates labels, and updates order records - all with one click.
