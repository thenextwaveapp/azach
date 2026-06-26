/**
 * Paystack Initialize Transaction Edge Function
 * Creates a Paystack payment transaction and reserves stock
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
  callback_url: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const requestBody: InitializeRequest = await req.json();
    const { items, userEmail, currency, shippingAddress, shippingCost, callback_url } =
      requestBody;

    // Validate request
    if (!items || items.length === 0 || !userEmail || !shippingAddress) {
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

    // Generate unique session ID for stock reservation
    const tempSessionId = crypto.randomUUID();

    // Reserve stock for each item (15 minute timeout)
    for (const item of items) {
      if (item.id === 'shipping') continue; // Skip shipping line item

      const { data, error } = await supabase.rpc('reserve_stock', {
        p_product_id: item.id,
        p_quantity: item.quantity,
        p_session_id: tempSessionId,
        p_duration_minutes: 15,
      });

      if (error || !data) {
        // If stock reservation fails, release all reservations and return error
        await supabase.rpc('release_reservation', { p_session_id: tempSessionId });

        return new Response(
          JSON.stringify({ error: `Insufficient stock for ${item.name}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
    }

    // Calculate total amount
    const subtotal = items.reduce((sum, item) => {
      return item.id !== 'shipping' ? sum + item.price * item.quantity : sum;
    }, 0);
    const total = subtotal + shippingCost;

    console.log('Payment calculation:', {
      subtotal,
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
        cartItems: JSON.stringify(items),
        shippingAddress: JSON.stringify(shippingAddress),
        reservationSessionId: tempSessionId,
        shippingCost,
        subtotal,
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

      // Release stock reservations on failure
      await supabase.rpc('release_reservation', { p_session_id: tempSessionId });

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
