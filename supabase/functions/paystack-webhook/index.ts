/**
 * Paystack Webhook Handler Edge Function
 * Handles Paystack payment events, creates orders, and updates stock
 * Similar to stripe-webhook but for Paystack
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { crypto } from 'https://deno.land/std@0.168.0/crypto/mod.ts';

/**
 * Verify Paystack webhook signature using HMAC SHA512
 */
async function verifyPaystackSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(payload);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', key, messageData);
  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  return hashHex === signature;
}

serve(async (req) => {
  try {
    const signature = req.headers.get('x-paystack-signature');

    if (!signature) {
      return new Response(JSON.stringify({ error: 'No signature' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await req.text();
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');

    if (!paystackSecretKey) {
      return new Response(
        JSON.stringify({ error: 'Paystack secret key not configured' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Verify webhook signature
    const isValid = await verifyPaystackSignature(body, signature, paystackSecretKey);

    if (!isValid) {
      console.error('Webhook signature verification failed');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse webhook event
    const event = JSON.parse(body);

    // Handle the charge.success event
    if (event.event === 'charge.success') {
      const data = event.data;
      const metadata = data.metadata || {};

      // Initialize Supabase client with service role key for admin access
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );

      // Check if order already exists (prevent duplicate processing)
      const { data: existingOrder } = await supabaseAdmin
        .from('orders')
        .select('id')
        .eq('paystack_reference', data.reference)
        .single();

      if (existingOrder) {
        console.log('Order already exists for reference:', data.reference);
        return new Response(JSON.stringify({ received: true, duplicate: true }), {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      // Parse cart items from metadata
      const cartItems = metadata.cartItems ? JSON.parse(metadata.cartItems) : [];

      if (!cartItems || cartItems.length === 0) {
        console.error('No cart items in metadata');
        return new Response('No cart items', { status: 400 });
      }

      // Parse shipping address from metadata
      const shippingAddress = metadata.shippingAddress
        ? JSON.parse(metadata.shippingAddress)
        : null;

      // Calculate totals (amount from Paystack is in kobo/cents)
      const total = data.amount / 100;
      const shippingCost = metadata.shippingCost || 0;
      const subtotal = total - shippingCost;

      // Get user ID from customer email if available
      let userId = null;
      if (data.customer?.email) {
        const { data: userData } = await supabaseAdmin
          .from('auth.users')
          .select('id')
          .eq('email', data.customer.email)
          .single();
        userId = userData?.id;
      }

      // Create order (use shipping address as billing address by default)
      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert({
          user_id: userId,
          status: 'processing',
          payment_status: 'paid',
          payment_provider: 'paystack',
          total: total,
          subtotal: subtotal,
          shipping_cost: shippingCost,
          paystack_reference: data.reference,
          paystack_access_code: data.access_code,
          shipping_address: shippingAddress,
          billing_address: shippingAddress, // Same as shipping for now
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        throw orderError;
      }

      // Create order items
      const orderItems = cartItems
        .filter((item: any) => item.id !== 'shipping')
        .map((item: any) => ({
          order_id: order.id,
          product_id: item.id,
          product_name: item.name,
          product_image: item.image,
          price: item.price,
          quantity: item.quantity,
        }));

      const { error: itemsError } = await supabaseAdmin
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        throw itemsError;
      }

      // Update product stock
      for (const item of cartItems) {
        if (item.id === 'shipping') continue;

        const { data: product } = await supabaseAdmin
          .from('products')
          .select('stock')
          .eq('id', item.id)
          .single();

        if (product) {
          const newStock = Math.max(0, product.stock - item.quantity);
          await supabaseAdmin
            .from('products')
            .update({
              stock: newStock,
              in_stock: newStock > 0,
            })
            .eq('id', item.id);
        }
      }

      // Release stock reservation
      const reservationSessionId = metadata.reservationSessionId;
      if (reservationSessionId) {
        await supabaseAdmin.rpc('release_reservation', {
          p_session_id: reservationSessionId,
        });
      }

      console.log('Order created successfully:', order.id);

      // TODO: Create DHL shipment (implement in Phase 4)
      // This would call DHL API to create shipment and get tracking number
      // await createDHLShipment(order.id, shippingAddress, orderItems);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
