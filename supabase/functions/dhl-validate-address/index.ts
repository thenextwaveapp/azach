/**
 * DHL Express Address Validation Edge Function
 * Validates if DHL can deliver to the specified address
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidateAddressRequest {
  type: 'pickup' | 'delivery';
  countryCode: string;
  postalCode?: string;
  cityName?: string;
  addressLine1?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const {
      type = 'delivery',
      countryCode,
      postalCode,
      cityName,
      addressLine1,
    }: ValidateAddressRequest = await req.json();

    if (!countryCode) {
      return new Response(
        JSON.stringify({ error: 'Country code is required' }),
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

    // Build query parameters
    const params = new URLSearchParams({
      type: type,
      countryCode: countryCode,
    });

    if (postalCode) params.append('postalCode', postalCode);
    if (cityName) params.append('cityName', cityName);
    if (addressLine1) params.append('addressLine1', addressLine1);

    console.log('Validating address:', { type, countryCode, postalCode, cityName });

    // Call DHL Address Validation API
    const dhlResponse = await fetch(
      `${dhlApiUrl}/address-validate?${params.toString()}`,
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
      console.error('DHL address validation error:', dhlResponse.status, errorText);

      // Some addresses might not be in DHL's database but are still serviceable
      if (dhlResponse.status === 404) {
        return new Response(
          JSON.stringify({
            valid: false,
            warning: 'Address not found in DHL database. Please verify the address is correct.',
            serviceable: null,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`DHL API error: ${errorText}`);
    }

    const dhlData = await dhlResponse.json();

    // Parse validation results
    const warnings = dhlData.warnings || [];
    const address = dhlData.address || {};

    // Check if address is serviceable
    const isServiceable = warnings.length === 0 ||
      !warnings.some((w: any) => w.message?.toLowerCase().includes('not serviceable'));

    return new Response(
      JSON.stringify({
        valid: warnings.length === 0,
        serviceable: isServiceable,
        warnings: warnings.map((w: any) => w.message || w),
        suggestedAddress: address.addressLine1 ? {
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          addressLine3: address.addressLine3,
          cityName: address.cityName,
          postalCode: address.postalCode,
          provinceCode: address.provinceCode,
          countryCode: address.countryCode,
        } : null,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('DHL address validation error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to validate address',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
