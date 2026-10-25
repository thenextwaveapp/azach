/**
 * Read-only check for whether a discount code is currently redeemable by a given email.
 * Does not reserve or redeem anything — that happens server-side in paystack-initialize /
 * paystack-webhook, since this is only used to show the discount in the UI before payment.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { code, email, subtotal } = await req.json();

    if (!code || typeof code !== 'string' || !email || typeof email !== 'string') {
      return new Response(JSON.stringify({ valid: false, error: 'Code and email are required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const normalizedCode = code.trim().toUpperCase();

    const { data: discount, error: lookupError } = await supabase
      .from('discount_codes')
      .select('id, code, percent_off, applies_to, usage_type, max_uses, min_spend')
      .eq('code', normalizedCode)
      .eq('active', true)
      .maybeSingle();

    if (lookupError) throw lookupError;

    if (!discount) {
      return new Response(JSON.stringify({ valid: false, error: 'Invalid discount code' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const minSpend = Number(discount.min_spend) || 0;
    if (subtotal !== undefined && subtotal !== null && Number(subtotal) < minSpend) {
      return new Response(JSON.stringify({ valid: false, error: `Minimum spend of ${minSpend} required` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: redemptions, error: redemptionError } = await supabase
      .from('discount_redemptions')
      .select('id')
      .eq('discount_code_id', discount.id);

    if (redemptionError) throw redemptionError;

    const usedCount = (redemptions || []).length;
    const usageType = discount.usage_type || 'single';

    if (usageType === 'single' && usedCount > 0) {
      return new Response(JSON.stringify({ valid: false, error: 'This code has already been used' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (usageType === 'multiple') {
      const maxUses = Number(discount.max_uses) || 0;
      if (maxUses > 0 && usedCount >= maxUses) {
        return new Response(JSON.stringify({ valid: false, error: 'This code has reached its usage limit' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(
      JSON.stringify({ valid: true, code: discount.code, percentOff: discount.percent_off, appliesTo: discount.applies_to || 'order' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('validate-discount-code error:', error);
    return new Response(
      JSON.stringify({ valid: false, error: error instanceof Error ? error.message : 'Failed to validate code' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
