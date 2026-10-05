/**
 * Paystack Initialize Transaction Edge Function
 * Creates a Paystack payment transaction after checking stock availability
 * Similar to create-checkout-session but for Paystack
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InitializeRequest {
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  userId: string;
  userEmail: string;
  currency: string;
  shippingAddress: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  shippingCost: number;
  shippingProvider?: string;
  shippingService?: string;
  callback_url: string;
  discountCode?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const requestBody: InitializeRequest = await req.json();
    const { items, userId, userEmail, currency, shippingAddress, shippingCost, shippingProvider, shippingService, callback_url, discountCode } =
      requestBody;

    // Validate request - userId must be a non-empty string
    if (!items || items.length === 0 || !userId || userId === '' || !userEmail || !shippingAddress) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Point-in-time stock check — no hold/reservation, just confirms enough stock exists
    // right now. A concurrent checkout could still race this between check and payment;
    // that's accepted (see decrement_stock_for_purchase, which floors at 0 either way).
    for (const item of items) {
      if (item.id === 'shipping') continue; // Skip shipping line item

      const { data: product, error } = await supabase
        .from('products')
        .select('stock')
        .eq('id', item.id)
        .maybeSingle();

      if (error || !product || product.stock < item.quantity) {
        return new Response(
          JSON.stringify({ error: `${item.name} is out of stock.` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
    }

    // Calculate total amount
    const subtotal = items.reduce((sum, item) => {
      return item.id !== 'shipping' ? sum + item.price * item.quantity : sum;
    }, 0);

    // Discounts must be validated and applied here, server-side — this is the amount that
    // actually gets charged. The frontend's "Apply" preview is UX only and cannot be trusted.
    let discountCodeId: string | null = null;
    let discountPercent = 0;
    let discountAmount = 0;
    let appliedDiscountCode: string | null = null;

    if (discountCode && discountCode.trim() !== '') {
      const normalizedCode = discountCode.trim().toUpperCase();

      const { data: discount, error: discountError } = await supabase
        .from('discount_codes')
        .select('id, code, percent_off')
        .eq('code', normalizedCode)
        .eq('active', true)
        .maybeSingle();

      if (discountError) throw discountError;

      if (!discount) {
        return new Response(
          JSON.stringify({ error: 'Invalid discount code' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Redeemable only once, period — not once per email. Codes are single-use.
      const { data: redemption, error: redemptionError } = await supabase
        .from('discount_redemptions')
        .select('id')
        .eq('discount_code_id', discount.id)
        .maybeSingle();

      if (redemptionError) throw redemptionError;

      if (redemption) {
        return new Response(
          JSON.stringify({ error: 'This discount code has already been used' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      discountCodeId = discount.id;
      appliedDiscountCode = discount.code;
      discountPercent = discount.percent_off;
      discountAmount = subtotal * (discountPercent / 100);
    }

    const total = subtotal - discountAmount + shippingCost;

    console.log('Payment calculation:', {
      subtotal,
      discountAmount,
      shippingCost,
      total,
    });

    // Convert to kobo (Paystack uses smallest currency unit)
    // For NGN: 1 NGN = 100 kobo
    // For USD: 1 USD = 100 cents
    const amountInKobo = Math.round(total * 100);

    console.log('Amount in kobo:', amountInKobo);

    // Prepare Paystack request
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!paystackSecretKey) {
      throw new Error('Paystack secret key not configured');
    }

    const paystackRequestBody = {
      email: userEmail,
      amount: amountInKobo,
      currency: currency.toUpperCase(),
      callback_url,
      metadata: {
        userId,
        cartItems: JSON.stringify(items),
        shippingAddress: JSON.stringify(shippingAddress),
        shippingCost,
        shippingProvider: shippingProvider || 'dhl',
        shippingService: shippingService || null,
        subtotal,
        discountCodeId,
        discountCode: appliedDiscountCode,
        discountAmount,
        custom_fields: [
          {
            display_name: 'Customer Name',
            variable_name: 'customer_name',
            value: shippingAddress.fullName,
          },
          {
            display_name: 'Cart Items',
            variable_name: 'cart_items',
            value: items.length,
          },
          {
            display_name: 'Shipping Country',
            variable_name: 'shipping_country',
            value: shippingAddress.country,
          },
        ],
      },
    };

    console.log('Paystack request:', JSON.stringify({
      email: paystackRequestBody.email,
      amount: paystackRequestBody.amount,
      currency: paystackRequestBody.currency,
    }));

    // Initialize Paystack transaction
    const paystackResponse = await fetch(
      'https://api.paystack.co/transaction/initialize',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paystackRequestBody),
      }
    );

    if (!paystackResponse.ok) {
      const errorData = await paystackResponse.json();
      console.error('Paystack API error:', JSON.stringify(errorData));

      return new Response(
        JSON.stringify({
          error: errorData.message || 'Failed to initialize payment',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const paystackData = await paystackResponse.json();

    if (!paystackData.status || !paystackData.data) {
      throw new Error('Invalid response from Paystack');
    }

    // Return Paystack transaction details
    return new Response(
      JSON.stringify({
        reference: paystackData.data.reference,
        access_code: paystackData.data.access_code,
        authorization_url: paystackData.data.authorization_url,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Paystack initialize error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to initialize payment',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
