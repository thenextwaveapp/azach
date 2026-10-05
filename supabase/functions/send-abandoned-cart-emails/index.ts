/**
 * Cron-triggered (hourly, via pg_cron) abandoned cart recovery.
 * Finds carts untouched for 1+ hour belonging to real (non-anonymous, non-guest) users,
 * sends one reminder email, and never reminds the same user more than once per 24h.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { sendEmail, abandonedCartEmail, SITE_URL } from '../_shared/email.ts';

serve(async (_req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: cartRows, error: cartError } = await supabase
      .from('cart_items')
      .select('user_id, quantity, updated_at, products(name, price, image_url)')
      .lt('updated_at', oneHourAgo);

    if (cartError) throw cartError;
    if (!cartRows || cartRows.length === 0) {
      return new Response(JSON.stringify({ sent: 0, reason: 'no stale carts' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const byUser = new Map<string, typeof cartRows>();
    for (const row of cartRows) {
      if (!byUser.has(row.user_id)) byUser.set(row.user_id, []);
      byUser.get(row.user_id)!.push(row);
    }

    let sent = 0;

    for (const [userId, rows] of byUser) {
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
      if (userError || !userData?.user || userData.user.is_anonymous || !userData.user.email) continue;

      const { data: existingReminder } = await supabase
        .from('abandoned_cart_reminders')
        .select('sent_at')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingReminder && existingReminder.sent_at > oneDayAgo) continue;

      const items = rows
        .filter((r: any) => r.products)
        .map((r: any) => ({
          name: r.products.name,
          qty: r.quantity,
          price: r.products.price,
          image: r.products.image_url,
        }));

      if (items.length === 0) continue;

      await sendEmail({
        to: userData.user.email,
        subject: 'You left something in your cart',
        html: abandonedCartEmail({ items, currency: 'NGN', checkoutUrl: `${SITE_URL}/cart` }),
      });

      await supabase
        .from('abandoned_cart_reminders')
        .upsert({ user_id: userId, sent_at: new Date().toISOString() }, { onConflict: 'user_id' });

      sent++;
    }

    return new Response(JSON.stringify({ sent }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('send-abandoned-cart-emails error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to send reminders' }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
