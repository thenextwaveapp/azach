import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    const { id, active, code, percent_off, applies_to, usage_type, max_uses, min_spend } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: 'id is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const update: Record<string, unknown> = {};
    if (active !== undefined) update.active = Boolean(active);
    if (code !== undefined) update.code = String(code).trim().toUpperCase();
    if (percent_off !== undefined) update.percent_off = Number(percent_off);
    if (applies_to !== undefined) update.applies_to = applies_to;
    if (usage_type !== undefined) {
      if (!['single', 'multiple', 'unlimited'].includes(usage_type)) {
        return new Response(JSON.stringify({ error: 'Invalid usage type' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }
      update.usage_type = usage_type;
      if (usage_type !== 'multiple') update.max_uses = null;
    }
    if (max_uses !== undefined) update.max_uses = max_uses === null ? null : Number(max_uses);
    if (min_spend !== undefined) update.min_spend = Number(min_spend) || 0;

    const { data, error } = await supabase
      .from('discount_codes')
      .update(update)
      .eq('id', id)
      .select('id, code, percent_off, applies_to, active, usage_type, max_uses, min_spend, issued_to_email, created_at')
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ code: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Failed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
