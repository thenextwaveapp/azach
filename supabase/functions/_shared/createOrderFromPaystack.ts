/**
 * Creates an order from a successful Paystack transaction — the one place order-creation
 * actually happens. Called from both paystack-webhook (the primary path) and paystack-verify
 * (the fallback the frontend calls on the success page, in case the webhook never fires or
 * gets rejected for any reason). Safe to call twice for the same reference: relies on the
 * unique constraint on orders.paystack_reference to make the second call a no-op rather than
 * a duplicate order, since a pre-check-then-insert alone would still race under concurrency.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { sendEmail, orderConfirmationEmail, internalNewOrderEmail, accountCreatedEmail, OPS_EMAIL, SITE_URL } from './email.ts';

type SupabaseAdmin = ReturnType<typeof createClient>;

async function sendOrderEmails(order: any, orderItems: any[], shippingAddress: any) {
  const currency = order.currency || 'NGN';
  const totals = {
    subtotal: order.subtotal,
    shipping: order.shipping_cost || 0,
    tax: order.tax || 0,
    total: order.total,
    currency,
  };
  const emailItems = orderItems.map((i) => ({ name: i.product_name, qty: i.quantity, price: i.price, image: i.product_image }));
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

export interface PaystackChargeData {
  reference: string;
  access_code?: string;
  amount: number;
  currency?: string;
  metadata: Record<string, any>;
}

export type CreateOrderResult =
  | { ok: true; duplicate: true; orderId: string }
  | { ok: true; duplicate: false; orderId: string }
  | { ok: false; error: string };

export async function createOrderFromPaystackTransaction(
  supabaseAdmin: SupabaseAdmin,
  data: PaystackChargeData
): Promise<CreateOrderResult> {
  const metadata = data.metadata || {};

  // Check if order already exists (prevent duplicate processing) — this is a fast-path
  // only; the unique constraint on paystack_reference is what actually guarantees safety
  // under concurrent calls (see the insert's error handling below).
  const { data: existingOrder } = await supabaseAdmin
    .from('orders')
    .select('id')
    .eq('paystack_reference', data.reference)
    .maybeSingle();

  if (existingOrder) {
    return { ok: true, duplicate: true, orderId: existingOrder.id as string };
  }

  const cartItems = metadata.cartItems ? JSON.parse(metadata.cartItems) : [];
  if (!cartItems || cartItems.length === 0) {
    return { ok: false, error: 'No cart items in metadata' };
  }

  const shippingAddress = metadata.shippingAddress ? JSON.parse(metadata.shippingAddress) : null;

  const total = data.amount / 100;
  const shippingCost = metadata.shippingCost || 0;
  const subtotal = total - shippingCost;
  const discountCodeId = metadata.discountCodeId || null;
  const discountCode = metadata.discountCode || null;
  const discountAmount = metadata.discountAmount || 0;

  const userId = metadata.userId;
  if (!userId || userId === '') {
    return { ok: false, error: 'Invalid user session' };
  }

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
      currency: data.currency || 'NGN',
      paystack_reference: data.reference,
      paystack_access_code: data.access_code,
      shipping_provider: metadata.shippingProvider || 'dhl',
      shipping_service: metadata.shippingService || null,
      shipping_address: shippingAddress,
      billing_address: shippingAddress,
      discount_code: discountCode,
      discount_amount: discountAmount,
    })
    .select()
    .single();

  if (orderError) {
    // Unique violation on paystack_reference means the webhook and the verify fallback
    // raced each other — whichever lost is not an error, just already-handled.
    if (orderError.code === '23505') {
      const { data: raceWinner } = await supabaseAdmin
        .from('orders')
        .select('id')
        .eq('paystack_reference', data.reference)
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

    // Deactivate so it can't be redeemed again and won't be handed out as a "reuse" on a
    // future welcome-popup signup for the same email.
    const { error: deactivateError } = await supabaseAdmin
      .from('discount_codes')
      .update({ active: false })
      .eq('id', discountCodeId);
    if (deactivateError) {
      console.error('Error deactivating redeemed discount code:', deactivateError);
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
    });

    if (stockError) {
      console.error('Error decrementing stock for', item.id, stockError);
    }
  }

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
