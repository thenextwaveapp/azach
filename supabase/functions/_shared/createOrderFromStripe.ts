/**
 * Creates an order from a completed Stripe Checkout Session — the one place Stripe
 * order-creation actually happens. Called from both stripe-webhook (the primary path)
 * and stripe-verify (the fallback the frontend calls on the success page, in case the
 * webhook never fires or gets rejected for any reason). Safe to call twice for the same
 * session: relies on the unique index on orders.stripe_session_id to make the second call
 * a no-op rather than a duplicate order, since a pre-check-then-insert alone would still
 * race under concurrency.
 *
 * The amounts and cart are NOT read from the Stripe session (which only carries a
 * reference id in metadata); they come from the pending_checkouts row written by
 * stripe-create-checkout, so the order is built entirely from server-trusted values.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { sendEmail, orderConfirmationEmail, internalNewOrderEmail, accountCreatedEmail, OPS_EMAIL, SITE_URL } from './email.ts';

type SupabaseAdmin = ReturnType<typeof createClient>;

async function sendOrderEmails(order: any, orderItems: any[], shippingAddress: any) {
  const currency = order.currency || 'USD';
  const totals = {
    subtotal: order.subtotal,
    shipping: order.shipping_cost || 0,
    tax: order.tax || 0,
    total: order.total,
    currency,
  };
  const emailItems = orderItems.map((i) => ({
    name: i.selected_size ? `${i.product_name} — Size ${i.selected_size}` : i.product_name,
    qty: i.quantity,
    price: i.price,
    image: i.product_image,
  }));
  const orderNumber = `#AZ-${order.id.slice(0, 8).toUpperCase()}`;
  const orderDate = new Date(order.created_at || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const customerName = shippingAddress?.fullName || shippingAddress?.name || 'there';
  const customerEmail = shippingAddress?.email;

  const tasks: Promise<void>[] = [];

  if (customerEmail) {
    tasks.push(
      sendEmail({
        to: customerEmail,
        subject: `Order Confirmed — ${orderNumber}`,
        html: orderConfirmationEmail({ customerName, orderNumber, orderDate, items: emailItems, totals }),
      })
    );
  }

  tasks.push(
    sendEmail({
      to: OPS_EMAIL,
      subject: `New Order Received — ${orderNumber}`,
      html: internalNewOrderEmail({
        orderNumber,
        orderDate,
        customer: {
          name: customerName,
          email: customerEmail || 'unknown',
          phone: shippingAddress?.phone,
          country: shippingAddress?.country,
        },
        shippingAddress: [
          shippingAddress?.address,
          shippingAddress?.city,
          shippingAddress?.state,
          shippingAddress?.postalCode,
          shippingAddress?.country,
        ].filter(Boolean).join(', '),
        items: emailItems,
        totals,
      }),
    })
  );

  await Promise.all(tasks);
}

/**
 * Converts an anonymous guest checkout session into a permanent account (same user_id,
 * so their order history stays linked), and emails them a one-time link to set their
 * own password — no temporary password is generated or transmitted.
 * No-ops if the user already has a real (non-anonymous) account.
 */
async function convertGuestToAccount(
  supabaseAdmin: SupabaseAdmin,
  userId: string,
  email: string,
  customerName: string
): Promise<void> {
  const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);

  if (error || !data?.user || !data.user.is_anonymous) {
    return;
  }

  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    email,
    email_confirm: true,
  });

  if (updateError) {
    console.error('Error converting guest to account:', updateError);
    return;
  }

  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: { redirectTo: `${SITE_URL}/set-password` },
  });

  if (linkError || !linkData?.properties?.action_link) {
    console.error('Error generating set-password link:', linkError);
    return;
  }

  await sendEmail({
    to: email,
    subject: 'Your AZACH Account Is Ready',
    html: accountCreatedEmail({
      customerName,
      email,
      setPasswordUrl: linkData.properties.action_link,
    }),
  });
}

export interface StripeSessionData {
  sessionId: string;
  paymentIntentId?: string | null;
  // The pending_checkouts row id passed through as client_reference_id / metadata.
  pendingCheckoutId?: string | null;
  // What Stripe actually charged, in the smallest unit (cents). Used only as a fallback
  // if the pending row is somehow missing a total; pending_checkouts.payload is authoritative.
  amountTotal?: number | null;
  currency?: string | null;
}

export type CreateOrderResult =
  | { ok: true; duplicate: true; orderId: string }
  | { ok: true; duplicate: false; orderId: string }
  | { ok: false; error: string };

export async function createOrderFromStripeSession(
  supabaseAdmin: SupabaseAdmin,
  data: StripeSessionData
): Promise<CreateOrderResult> {
  // Check if order already exists (prevent duplicate processing) — this is a fast-path
  // only; the unique index on stripe_session_id is what actually guarantees safety under
  // concurrent calls (see the insert's error handling below).
  const { data: existingOrder } = await supabaseAdmin
    .from('orders')
    .select('id')
    .eq('stripe_session_id', data.sessionId)
    .maybeSingle();

  if (existingOrder) {
    return { ok: true, duplicate: true, orderId: existingOrder.id as string };
  }

  if (!data.pendingCheckoutId) {
    return { ok: false, error: 'Missing pending checkout reference' };
  }

  // The server-trusted snapshot written at session-creation time. Everything about the
  // order (items, amounts, discount, shipping) comes from here, never from the client.
  const { data: pending } = await supabaseAdmin
    .from('pending_checkouts')
    .select('payload')
    .eq('id', data.pendingCheckoutId)
    .maybeSingle();

  if (!pending?.payload) {
    return { ok: false, error: 'Pending checkout not found' };
  }

  const payload = pending.payload as Record<string, any>;

  const cartItems = Array.isArray(payload.cartItems) ? payload.cartItems : [];
  if (cartItems.length === 0) {
    return { ok: false, error: 'No cart items in pending checkout' };
  }

  const shippingAddress = payload.shippingAddress || null;
  const shippingCost = Number(payload.shippingCost) || 0;
  const discountAmount = Number(payload.discountAmount) || 0;
  const subtotal = Number(payload.subtotal) || 0;
  const total = payload.total != null
    ? Number(payload.total)
    : (data.amountTotal != null ? data.amountTotal / 100 : subtotal + shippingCost - discountAmount);
  const currency = payload.currency || data.currency?.toUpperCase() || 'USD';
  const discountCodeId = payload.discountCodeId || null;
  const discountCode = payload.discountCode || null;

  const userId = payload.userId;
  if (!userId || userId === '') {
    return { ok: false, error: 'Invalid user session' };
  }

  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      user_id: userId,
      status: 'processing',
      payment_status: 'paid',
      payment_provider: 'stripe',
      total: total,
      subtotal: subtotal,
      shipping_cost: shippingCost,
      currency: currency,
      stripe_session_id: data.sessionId,
      stripe_payment_intent_id: data.paymentIntentId || null,
      shipping_provider: payload.shippingProvider || 'dhl',
      shipping_service: payload.shippingService || null,
      shipping_address: shippingAddress,
      billing_address: shippingAddress,
      discount_code: discountCode,
      discount_amount: discountAmount,
    })
    .select()
    .single();

  if (orderError) {
    // Unique violation on stripe_session_id means the webhook and the verify fallback
    // raced each other — whichever lost is not an error, just already-handled.
    if (orderError.code === '23505') {
      const { data: raceWinner } = await supabaseAdmin
        .from('orders')
        .select('id')
        .eq('stripe_session_id', data.sessionId)
        .maybeSingle();
      if (raceWinner) {
        return { ok: true, duplicate: true, orderId: raceWinner.id as string };
      }
    }
    console.error('Error creating order:', orderError);
    return { ok: false, error: orderError.message };
  }

  if (discountCodeId && shippingAddress?.email) {
    const { error: redemptionError } = await supabaseAdmin.from('discount_redemptions').insert({
      discount_code_id: discountCodeId,
      email: shippingAddress.email.trim().toLowerCase(),
      order_id: order.id,
    });
    if (redemptionError) {
      console.error('Error recording discount redemption:', redemptionError);
    }

    const { data: discountRow } = await supabaseAdmin
      .from('discount_codes')
      .select('usage_type, max_uses')
      .eq('id', discountCodeId)
      .maybeSingle();

    const usageType = discountRow?.usage_type || 'single';
    let shouldDeactivate = usageType === 'single';

    if (usageType === 'multiple') {
      const { count } = await supabaseAdmin
        .from('discount_redemptions')
        .select('id', { count: 'exact', head: true })
        .eq('discount_code_id', discountCodeId);
      const maxUses = Number(discountRow?.max_uses) || 0;
      if (maxUses > 0 && (count || 0) >= maxUses) {
        shouldDeactivate = true;
      }
    }

    if (shouldDeactivate) {
      const { error: deactivateError } = await supabaseAdmin
        .from('discount_codes')
        .update({ active: false })
        .eq('id', discountCodeId);
      if (deactivateError) {
        console.error('Error deactivating redeemed discount code:', deactivateError);
      }
    }
  }

  const orderItems = cartItems
    .filter((item: any) => item.id !== 'shipping')
    .map((item: any) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      product_image: item.image,
      price: item.price,
      quantity: item.quantity,
      selected_size: item.size || null,
    }));

  const { error: itemsError } = await supabaseAdmin.from('order_items').insert(orderItems);
  if (itemsError) {
    console.error('Error creating order items:', itemsError);
    return { ok: false, error: itemsError.message };
  }

  // Update product stock. Bundle/set products have their stock computed from
  // components, so this decrements the underlying component pieces instead.
  for (const item of cartItems) {
    if (item.id === 'shipping') continue;

    const { error: stockError } = await supabaseAdmin.rpc('decrement_stock_for_purchase', {
      p_product_id: item.id,
      p_quantity: item.quantity,
      p_size: item.size || null,
    });

    if (stockError) {
      console.error('Error decrementing stock for', item.id, stockError);
    }
  }

  // Best-effort cleanup — the row has served its purpose. A leftover row is harmless
  // (the dedup check above already prevents a second order), so a failed delete is ignored.
  await supabaseAdmin.from('pending_checkouts').delete().eq('id', data.pendingCheckoutId);

  console.log('Order created successfully:', order.id);

  await sendOrderEmails(order, orderItems, shippingAddress);

  if (shippingAddress?.email) {
    await convertGuestToAccount(
      supabaseAdmin,
      userId,
      shippingAddress.email,
      shippingAddress.fullName || shippingAddress.name || 'there'
    );
  }

  return { ok: true, duplicate: false, orderId: order.id as string };
}
