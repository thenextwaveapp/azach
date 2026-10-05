/**
 * Fallback order-creation path, called from the frontend's checkout success page.
 * The webhook is the primary path; this exists because a webhook delivery can fail for
 * reasons that have nothing to do with whether the payment actually succeeded (a Supabase
 * config issue, a transient error, a bug). Since the browser only reaches the success page
 * after Paystack has actually redirected back from a completed payment attempt, actively
 * verifying with Paystack here and creating the order if missing closes that gap.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { createOrderFromPaystackTransaction } from '../_shared/createOrderFromPaystack.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { reference } = await req.json();

    if (!reference || typeof reference !== 'string') {
      return new Response(JSON.stringify({ error: 'reference is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!paystackSecretKey) {
      throw new Error('Paystack secret key not configured');
    }

    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${paystackSecretKey}` } }
    );

    if (!verifyResponse.ok) {
      const errorData = await verifyResponse.json().catch(() => null);
      return new Response(
        JSON.stringify({ status: 'failed', error: errorData?.message || 'Could not verify transaction' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const verifyData = await verifyResponse.json();
    const data = verifyData?.data;

    if (!data || data.status !== 'success') {
      return new Response(
        JSON.stringify({ status: data?.status || 'failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const result = await createOrderFromPaystackTransaction(supabaseAdmin, data);

    if (!result.ok) {
      console.error('paystack-verify: order creation failed:', result.error);
      return new Response(
        JSON.stringify({ status: 'success', error: result.error }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        status: 'success',
        reference: data.reference,
        amount: data.amount,
        currency: data.currency,
        transaction_date: data.paid_at || data.transaction_date,
        order_id: result.orderId,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('paystack-verify error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to verify payment' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
