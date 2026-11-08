/**
 * Stripe Create Checkout Session Edge Function
 * Validates stock + discount server-side, snapshots the fully-priced order into
 * pending_checkouts, then creates a Stripe Checkout Session and returns its hosted URL.
 * The Stripe equivalent of paystack-initialize.
 *
 * Everything is priced in USD: the Stripe account settles in USD/CAD and cannot charge
 * NGN, so the frontend sends USD amounts (the product USD anchor, or the on-screen amount
 * converted to USD at the live rate) and we charge exactly those.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateCheckoutRequest {
  items: Array<{
    id: string;
    name: string;
    price: number; // USD
    quantity: number;
    image: string;
    size?: string;
  }>;
  userId: string;
  userEmail: string;
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
  shippingCost: number; // USD
  shippingProvider?: string;
  shippingService?: string;
  successUrl: string;
  cancelUrl: string;
  discountCode?: string;
}

const CURRENCY = 'usd';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: CreateCheckoutRequest = await req.json();
    const {
      items, userId, userEmail, shippingAddress, shippingCost,
      shippingProvider, shippingService, successUrl, cancelUrl, discountCode,
    } = body;

    if (!items || items.length === 0 || !userId || userId === '' || !userEmail || !shippingAddress || !successUrl || !cancelUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Point-in-time stock check — no hold/reservation, just confirms enough stock exists
    // right now. A concurrent checkout could still race this between check and payment;
    // that's accepted (see decrement_stock_for_purchase, which floors at 0 either way).
    // Checked per size when the product tracks size_stock, else against the total.
    for (const item of items) {
      if (item.id === 'shipping') continue;

      const { data: product, error } = await supabase
        .from('products')
        .select('stock, size_stock')
        .eq('id', item.id)
        .maybeSingle();

      if (error || !product) {
        return new Response(
          JSON.stringify({ error: `${item.name} is out of stock.` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      const sizeStock = product.size_stock as Record<string, number> | null;
      const available =
        item.size && sizeStock && item.size in sizeStock
          ? sizeStock[item.size] ?? 0
          : product.stock;

      if (available < item.quantity) {
        const label = item.size ? `${item.name} (Size ${item.size})` : item.name;
        return new Response(
          JSON.stringify({ error: `${label} is out of stock.` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
    }

    const productItems = items.filter((item) => item.id !== 'shipping');

    const subtotal = productItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Discounts must be validated and applied here, server-side — this is the amount that
    // actually gets charged. The frontend's "Apply" preview is UX only and cannot be trusted.
    let discountCodeId: string | null = null;
    let discountPercent = 0;
    let discountAmount = 0;
    let appliedDiscountCode: string | null = null;
    let discountAppliesTo = 'order';

    if (discountCode && discountCode.trim() !== '') {
      const normalizedCode = discountCode.trim().toUpperCase();

      const { data: discount, error: discountError } = await supabase
        .from('discount_codes')
        .select('id, code, percent_off, applies_to, usage_type, max_uses, min_spend')
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

      const minSpend = Number(discount.min_spend) || 0;
      if (subtotal < minSpend) {
        return new Response(
          JSON.stringify({ error: `Minimum spend of ${minSpend} required` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      const { data: redemptions, error: redemptionError } = await supabase
        .from('discount_redemptions')
        .select('id')
        .eq('discount_code_id', discount.id);

      if (redemptionError) throw redemptionError;

      const usedCount = (redemptions || []).length;
      const usageType = discount.usage_type || 'single';
      if (usageType === 'single' && usedCount > 0) {
        return new Response(
          JSON.stringify({ error: 'This discount code has already been used' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      if (usageType === 'multiple') {
        const maxUses = Number(discount.max_uses) || 0;
        if (maxUses > 0 && usedCount >= maxUses) {
          return new Response(
            JSON.stringify({ error: 'This discount code has reached its usage limit' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
      }

      discountCodeId = discount.id;
      appliedDiscountCode = discount.code;
      discountPercent = discount.percent_off;
      discountAppliesTo = discount.applies_to || 'order';
      discountAmount = discountAppliesTo === 'shipping'
        ? shippingCost * (discountPercent / 100)
        : subtotal * (discountPercent / 100);
    }

    const total = subtotal + shippingCost - discountAmount;

    console.log('Payment calculation (USD):', { subtotal, discountAmount, shippingCost, total });

    // Snapshot the server-trusted order. Stripe metadata caps values at 500 chars, so the
    // cart/address/discount payload lives here and only this row's id rides on the session.
    const { data: pending, error: pendingError } = await supabase
      .from('pending_checkouts')
      .insert({
        user_id: userId,
        payload: {
          userId,
          cartItems: items,
          shippingAddress,
          shippingCost,
          shippingProvider: shippingProvider || 'dhl',
          shippingService: shippingService || null,
          subtotal,
          discountCodeId,
          discountCode: appliedDiscountCode,
          discountAmount,
          discountAppliesTo,
          currency: 'USD',
          total,
        },
      })
      .select('id')
      .single();

    if (pendingError || !pending) {
      console.error('Error creating pending checkout:', pendingError);
      throw new Error('Could not start checkout');
    }

    // Itemised line items at full price; the discount rides as a separate coupon so the
    // hosted page shows a proper "discount" line rather than silently-reduced prices.
    const lineItems = productItems.map((item) => {
      const productData: Record<string, any> = { name: item.name };
      if (item.size) productData.description = `Size ${item.size}`;
      if (item.image && item.image.trim() !== '') productData.images = [item.image];
      return {
        price_data: {
          currency: CURRENCY,
          product_data: productData,
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      };
    });

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      customer_email: userEmail || undefined,
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: pending.id,
      metadata: {
        pendingCheckoutId: pending.id,
        userId,
      },
    };

    if (shippingCost > 0) {
      sessionParams.shipping_options = [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: Math.round(shippingCost * 100), currency: CURRENCY },
            display_name: shippingProvider === 'topship' ? 'Topship' : 'DHL Express',
          },
        },
      ];
    }

    // A fixed amount_off coupon handles both "order" and "shipping" discounts uniformly —
    // in each case it's the exact USD amount we already computed off the session total.
    if (discountAmount > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: Math.round(discountAmount * 100),
        currency: CURRENCY,
        duration: 'once',
        name: appliedDiscountCode || 'Discount',
      });
      sessionParams.discounts = [{ coupon: coupon.id }];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    // Correlate the pending row with its session for easier debugging / later cleanup.
    await supabase
      .from('pending_checkouts')
      .update({ stripe_session_id: session.id })
      .eq('id', pending.id);

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('stripe-create-checkout error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to initialize payment' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
