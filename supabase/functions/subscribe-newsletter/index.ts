/**
 * Handles newsletter signups: stores the email and sends a welcome email.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { sendEmail, welcomeEmail, welcomeDiscountEmail } from '../_shared/email.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Percent off granted by the welcome popup. Each signup gets its own randomly generated,
// single-use code (tracked via discount_codes.issued_to_email) rather than a shared code.
const WELCOME_POPUP_PERCENT_OFF = 15;

// Excludes ambiguous characters (0/O, 1/I) so codes are easy to type from an email.
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateCode(length = 8): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => CODE_CHARS[b % CODE_CHARS.length]).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, withDiscount } = await req.json();

    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ error: 'email is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: insertError } = await supabase
      .from('newsletter_subscribers')
      .upsert({ email }, { onConflict: 'email', ignoreDuplicates: true });

    if (insertError) {
      console.error('Error inserting newsletter subscriber:', insertError);
      throw insertError;
    }

    if (withDiscount) {
      const normalizedEmail = email.trim().toLowerCase();

      // One welcome code per email, ever — look up ANY code issued to this email, not just
      // still-active ones. Scoping to active=true would let someone redeem their code, then
      // resubmit the same email and mint (and email) themselves a fresh one indefinitely.
      const { data: existing } = await supabase
        .from('discount_codes')
        .select('id, code, percent_off, active')
        .eq('issued_to_email', normalizedEmail)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      let discount: { code: string; percent_off: number } | null = null;
      let alreadyRedeemed = false;

      if (existing) {
        if (existing.active) {
          discount = existing;
        } else {
          alreadyRedeemed = true;
        }
      } else {
        for (let attempt = 0; attempt < 5 && !discount; attempt++) {
          const { data: inserted, error: insertDiscountError } = await supabase
            .from('discount_codes')
            .insert({
              code: generateCode(),
              percent_off: WELCOME_POPUP_PERCENT_OFF,
              active: true,
              issued_to_email: normalizedEmail,
            })
            .select('id, code, percent_off')
            .single();

          if (!insertDiscountError) {
            discount = inserted;
          } else if (insertDiscountError.code !== '23505') {
            // Not a unique-code collision — no point retrying.
            console.error('Error creating welcome discount code:', insertDiscountError);
            break;
          }
        }
      }

      if (discount) {
        await sendEmail({
          to: email,
          subject: 'Your AZACH Welcome Code',
          html: welcomeDiscountEmail({ email, code: discount.code, percentOff: discount.percent_off }),
          text: `Welcome to AZACH!\n\nYour discount code: ${discount.code}\n${discount.percent_off}% off your first order — enter this code at checkout.\n\nShop now: https://azach.ng`,
          listUnsubscribe: `<mailto:info@azach.ng?subject=unsubscribe>`,
        });
      } else if (alreadyRedeemed) {
        await sendEmail({ to: email, subject: 'Welcome to AZACH', html: welcomeEmail({ email }) });
      } else {
        console.error('Failed to generate a welcome discount code — sending plain welcome email');
        await sendEmail({ to: email, subject: 'Welcome to AZACH', html: welcomeEmail({ email }) });
      }
    } else {
      await sendEmail({
        to: email,
        subject: 'Welcome to AZACH',
        html: welcomeEmail({ email }),
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('subscribe-newsletter error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to subscribe' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
