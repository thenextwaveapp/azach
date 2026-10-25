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
    const { data: codes, error } = await supabase
      .from('discount_codes')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;

    const ids = (codes || []).map((c: any) => c.id);
    let counts: Record<string, number> = {};
    if (ids.length) {
      const { data: redemptions } = await supabase
        .from('discount_redemptions')
        .select('discount_code_id')
        .in('discount_code_id', ids);
      (redemptions || []).forEach((r: any) => {
        counts[r.discount_code_id] = (counts[r.discount_code_id] || 0) + 1;
      });
    }

    const enriched = (codes || []).map((c: any) => ({ ...c, used_count: counts[c.id] || 0 }));

    return new Response(JSON.stringify({ codes: enriched }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Failed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
