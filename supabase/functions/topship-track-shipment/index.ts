/**
 * Topship Track Shipment Edge Function
 * Fetches current status and location for a Topship tracking id.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { trackingId } = await req.json();

    if (!trackingId) {
      return new Response(
        JSON.stringify({ error: 'Tracking ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const apiKey = Deno.env.get('TOPSHIP_API_KEY');
    if (!apiKey) {
      throw new Error('Topship API key not configured');
    }
    const apiUrl = Deno.env.get('TOPSHIP_API_URL') || 'https://topship-staging.africa/api';

    const response = await fetch(
      `${apiUrl}/track-shipment?trackingId=${encodeURIComponent(trackingId)}`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Topship tracking error:', response.status, errorText);
      throw new Error(`Topship API error: ${errorText}`);
    }

    const data = await response.json();
    const shipment = Array.isArray(data?.shipments) ? data.shipments[0] : null;

    return new Response(
      JSON.stringify({
        trackingId: data.trackingId || trackingId,
        status: data.status || '',
        statusDescription: data.message || '',
        currentLocation: data.itemLocation || '',
        transshipmentPoint: data.transshipmentPoint || '',
        estimatedDelivery: shipment?.estimatedDeliveryDate || '',
        origin: shipment?.senderDetail?.city || '',
        destination: shipment?.receiverDetail?.city || '',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Topship track shipment error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to track shipment',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
