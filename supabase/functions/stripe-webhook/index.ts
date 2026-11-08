/**
 * Stripe Webhook Handler Edge Function
 * Verifies the Stripe-Signature and, on checkout.session.completed, creates the order via
 * the shared creator (dedup, discounts, stock, emails, guest conversion). The primary
 * order-creation path; stripe-verify is the success-page fallback. The Stripe equivalent
 * of paystack-webhook.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { createOrderFromStripeSession } from '../_shared/createOrderFromStripe.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return new Response(JSON.stringify({ error: 'No signature' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      return new Response(JSON.stringify({ error: 'Webhook secret not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await req.text();

    // Verify webhook signature (async variant required under Deno's crypto).
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err instanceof Error ? err.message : err);
      return new Response(JSON.stringify({ error: 'Webhook signature verification failed' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

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
        console.error('Order creation failed:', result.error);
        return new Response(JSON.stringify({ error: result.error }), {
          headers: { 'Content-Type': 'application/json' },
          status: 400,
        });
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
