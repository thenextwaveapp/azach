/**
 * DHL Express Track Shipment Edge Function
 * Tracks a DHL shipment and returns current status and delivery timeline
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrackRequest {
  trackingNumber: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { trackingNumber }: TrackRequest = await req.json();

    if (!trackingNumber) {
      return new Response(
        JSON.stringify({ error: 'Tracking number is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get DHL API credentials
    const dhlApiKey = Deno.env.get('DHL_API_KEY');
    const dhlApiSecret = Deno.env.get('DHL_API_SECRET');

    if (!dhlApiKey || !dhlApiSecret) {
      throw new Error('DHL API credentials not configured');
    }

    const authString = btoa(`${dhlApiKey}:${dhlApiSecret}`);
    const dhlApiUrl = Deno.env.get('DHL_API_URL') || 'https://express.api.dhl.com/mydhlapi/test';

    console.log('Tracking DHL shipment:', trackingNumber);

    // Call DHL Tracking API
    const dhlResponse = await fetch(
      `${dhlApiUrl}/shipments/${trackingNumber}/tracking`,
      {
        method: 'GET',
        headers: {
          Authorization: `Basic ${authString}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!dhlResponse.ok) {
      const errorText = await dhlResponse.text();
      console.error('DHL tracking API error:', dhlResponse.status, errorText);

      if (dhlResponse.status === 404) {
        return new Response(
          JSON.stringify({ error: 'Tracking number not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        );
      }

      throw new Error(`DHL API error: ${errorText}`);
    }

    const dhlData = await dhlResponse.json();
    const shipments = dhlData.shipments || [];

    if (shipments.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No tracking information available' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    const shipment = shipments[0];
    const latestEvent = shipment.events?.[0] || {};

    // Parse tracking events
    const events = (shipment.events || []).map((event: any) => ({
      timestamp: event.timestamp,
      location: event.location?.address?.addressLocality || 'Unknown',
      description: event.description || '',
      statusCode: event.statusCode || '',
      serviceArea: event.serviceArea?.[0]?.description || '',
    }));

    // Determine current status
    let status = 'in_transit';
    const latestStatusCode = latestEvent.statusCode || '';

    if (latestStatusCode.includes('delivered') || latestStatusCode.toLowerCase().includes('ok')) {
      status = 'delivered';
    } else if (latestStatusCode.includes('transit') || latestStatusCode.includes('PU')) {
      status = 'in_transit';
    } else if (latestStatusCode.includes('exception') || latestStatusCode.includes('error')) {
      status = 'exception';
    }

    // Extract delivery information
    const estimatedDelivery = shipment.estimatedDeliveryDate || '';
    const origin = shipment.origin?.address?.addressLocality || '';
    const destination = shipment.destination?.address?.addressLocality || '';

    return new Response(
      JSON.stringify({
        trackingNumber: trackingNumber,
        status: status,
        statusDescription: latestEvent.description || 'Shipment in transit',
        estimatedDelivery: estimatedDelivery,
        origin: origin,
        destination: destination,
        currentLocation: latestEvent.location?.address?.addressLocality || '',
        events: events,
        shipmentDetails: {
          service: shipment.service || '',
          totalWeight: shipment.details?.weight?.value || 0,
          numberOfPieces: shipment.details?.numberOfPieces || 1,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('DHL tracking error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to track shipment',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
