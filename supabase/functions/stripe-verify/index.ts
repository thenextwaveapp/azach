/**
 * Fallback order-creation path, called from the frontend's checkout success page.
 * The webhook is the primary path; this exists because a webhook delivery can fail for
 * reasons that have nothing to do with whether the payment actually succeeded (a Supabase
 * config issue, a transient error, a bug). Since the browser only reaches the success page
 * after Stripe redirects back from a completed Checkout Session, actively retrieving the
 * session here and creating the order if missing closes that gap.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { createOrderFromStripeSession } from '../_shared/createOrderFromStripe.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();

    if (!sessionId || typeof sessionId !== 'string') {
      return new Response(JSON.stringify({ error: 'sessionId is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return new Response(
        JSON.stringify({ status: session.payment_status || 'failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const result = await createOrderFromStripeSession(supabaseAdmin, {
      sessionId: session.id,
      paymentIntentId: (session.payment_intent as string) || null,
      pendingCheckoutId: session.client_reference_id || session.metadata?.pendingCheckoutId || null,
      amountTotal: session.amount_total ?? null,
      currency: session.currency ?? null,
    });

    if (!result.ok) {
      console.error('stripe-verify: order creation failed:', result.error);
      return new Response(
        JSON.stringify({ status: 'success', error: result.error }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        status: 'success',
        sessionId: session.id,
        amount: session.amount_total,
        currency: session.currency,
        order_id: result.orderId,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('stripe-verify error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to verify payment' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
