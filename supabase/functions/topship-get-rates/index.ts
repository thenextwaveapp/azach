/**
 * Topship Get Rates Edge Function
 * Fetches shipping rates from the Topship API for cart items.
 * Topship quotes on sender/receiver city+country and total weight — no postal code needed.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RateRequest {
  destinationCountry: string;
  destinationCity?: string;
  items: Array<{
    id: string;
    quantity: number;
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const requestBody: RateRequest = await req.json();
    const { destinationCountry, destinationCity, items } = requestBody;

    if (!destinationCountry || !destinationCity || !items || items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: destinationCountry, destinationCity and items' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const apiKey = Deno.env.get('TOPSHIP_API_KEY');
    if (!apiKey) {
      throw new Error('Topship API key not configured');
    }
    const apiUrl = Deno.env.get('TOPSHIP_API_URL') || 'https://topship-staging.africa/api';

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let totalWeight = 0;
    for (const item of items) {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('weight_kg')
        .eq('id', item.id)
        .single();

      if (productError || !product) {
        console.error(`Product not found: ${item.id}`, productError);
        continue;
      }

      totalWeight += (product.weight_kg || 0.5) * item.quantity;
    }

    totalWeight = Math.max(totalWeight, 0.1);

    const shipmentDetail = {
      senderDetails: {
        cityName: Deno.env.get('TOPSHIP_ORIGIN_CITY') || 'Lagos',
        countryCode: 'NG',
      },
      receiverDetails: {
        cityName: destinationCity,
        countryCode: destinationCountry,
      },
      totalWeight,
    };

    const url = `${apiUrl}/get-shipment-rate?shipmentDetail=${encodeURIComponent(JSON.stringify(shipmentDetail))}`;
    const topshipResponse = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!topshipResponse.ok) {
      const errorText = await topshipResponse.text();
      console.error('Topship API error:', topshipResponse.status, errorText);
      throw new Error(`Topship API error: ${errorText}`);
    }

    const quotes = await topshipResponse.json();
    if (!Array.isArray(quotes) || quotes.length === 0) {
      throw new Error('No shipping rates available from Topship');
    }

    // Costs come back in kobo — convert to NGN to match the DHL rates the site already uses.
    const rates = quotes
      .filter((q: any) => !q.isDisabled && q.cost > 0)
      .map((q: any) => ({
        pricingTier: q.pricingTier,
        mode: q.mode,
        totalPrice: Math.ceil(q.cost / 100),
        currencyCode: 'NGN',
        duration: q.duration || '',
        estimatedDeliveryDate: q.estimatedDeliveryDate || '',
        isRecommended: !!q.isRecommended,
      }));

    if (rates.length === 0) {
      throw new Error('No shipping rates available from Topship for this destination');
    }

    return new Response(
      JSON.stringify({ rates, totalWeight }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Topship rates error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to get shipping rates',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
