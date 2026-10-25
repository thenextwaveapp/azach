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

    const { code: rawCode, percent_off, applies_to, active } = await req.json();

    if (!rawCode || typeof rawCode !== 'string') {
      return new Response(JSON.stringify({ error: 'Code is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const { data, error } = await supabase
      .from('discount_codes')
      .insert({
        code: rawCode.trim().toUpperCase(),
        percent_off: Number(percent_off),
        applies_to: applies_to || 'order',
        active: active === undefined ? true : Boolean(active),
      })
      .select('id, code, percent_off, applies_to, active, issued_to_email, created_at')
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
