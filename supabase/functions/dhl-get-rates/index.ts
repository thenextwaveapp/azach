/**
 * DHL Express Get Rates Edge Function
 * Fetches shipping rates from DHL Express API for cart items
 * Implements caching to reduce API calls and improve performance
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RateRequest {
  destinationCountry: string;
  destinationPostalCode?: string;
  destinationCity?: string;
  items: Array<{
    id: string;
    quantity: number;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const requestBody: RateRequest = await req.json();
    const { destinationCountry, destinationPostalCode, destinationCity, items } = requestBody;

    // Validate request
    if (!destinationCountry || !items || items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: destinationCountry and items' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Calculate cart hash for caching
    const cartHashInput = items.map((i) => `${i.id}-${i.quantity}`).sort().join('|');
    const cartHash = btoa(cartHashInput);

    // Check cache first
    const { data: cachedRate } = await supabase
      .from('shipping_rate_cache')
      .select('*')
      .eq('cart_hash', cartHash)
      .eq('destination_country', destinationCountry)
      .eq('destination_postal_code', destinationPostalCode || '')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (cachedRate) {
      console.log('Cache hit for cart hash:', cartHash);
      return new Response(
        JSON.stringify({
          rates: [
            {
              productCode: cachedRate.dhl_product_code || 'P',
              productName: cachedRate.service_type || 'DHL Express Worldwide',
              totalPrice: parseFloat(cachedRate.rate_ngn),
              currencyCode: cachedRate.currency_code || 'NGN',
              estimatedDeliveryDate: '',
              estimatedDeliveryDays: cachedRate.estimated_days || 5,
            },
          ],
          totalWeight: parseFloat(cachedRate.total_weight_kg),
          cacheHit: true,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate total weight and dimensions from cart items
    let totalWeight = 0;
    let maxLength = 0;
    let maxWidth = 0;
    let maxHeight = 0;

    for (const item of items) {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('weight_kg, length_cm, width_cm, height_cm, price')
        .eq('id', item.id)
        .single();

      if (productError || !product) {
        console.error(`Product not found: ${item.id}`, productError);
        continue;
      }

      totalWeight += (product.weight_kg || 0.5) * item.quantity;
      maxLength = Math.max(maxLength, product.length_cm || 20);
      maxWidth = Math.max(maxWidth, product.width_cm || 15);
      maxHeight = Math.max(maxHeight, product.height_cm || 10);
    }

    // Ensure minimum weight for DHL API (0.1 kg)
    totalWeight = Math.max(totalWeight, 0.1);

    // Prepare DHL API request
    const plannedShippingDate = new Date();
    plannedShippingDate.setDate(plannedShippingDate.getDate() + 1); // Next day

    const dhlRequestBody = {
      customerDetails: {
        shipperDetails: {
          postalCode: Deno.env.get('DHL_ORIGIN_POSTAL_CODE') || '100001',
          cityName: Deno.env.get('DHL_ORIGIN_CITY') || 'Lagos',
          countryCode: 'NG',
        },
        receiverDetails: {
          postalCode: destinationPostalCode || '',
          cityName: destinationCity || '',
          countryCode: destinationCountry,
        },
      },
      accounts: [
        {
          typeCode: 'shipper',
          number: Deno.env.get('DHL_ACCOUNT_NUMBER'),
        },
      ],
      plannedShippingDateAndTime: plannedShippingDate.toISOString(),
      unitOfMeasurement: 'metric',
      isCustomsDeclarable: destinationCountry !== 'NG',
      packages: [
        {
          weight: totalWeight,
          dimensions: {
            length: Math.ceil(maxLength),
            width: Math.ceil(maxWidth),
            height: Math.ceil(maxHeight),
          },
        },
      ],
    };

    // Call DHL Express Rating API
    const dhlApiKey = Deno.env.get('DHL_API_KEY');
    const dhlApiSecret = Deno.env.get('DHL_API_SECRET');

    if (!dhlApiKey || !dhlApiSecret) {
      console.error('DHL API credentials not configured');
      return new Response(
        JSON.stringify({
          error: 'Shipping service not configured. Please contact support.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const authString = btoa(`${dhlApiKey}:${dhlApiSecret}`);

    const dhlResponse = await fetch('https://express.api.dhl.com/mydhlapi/rates', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authString}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dhlRequestBody),
    });

    if (!dhlResponse.ok) {
      const errorText = await dhlResponse.text();
      console.error('DHL API error:', dhlResponse.status, errorText);

      return new Response(
        JSON.stringify({
          error: `Failed to get shipping rates: ${errorText}`,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: dhlResponse.status }
      );
    }

    const dhlData = await dhlResponse.json();
    const products = dhlData.products || [];

    if (products.length === 0) {
      throw new Error('No shipping rates available from DHL');
    }

    // Convert DHL rates to NGN (DHL returns USD)
    const usdToNgnRate = 1450; // Update this with live rate or fetch from API
    const rates = products.map((product: any) => {
      const priceUsd = product.totalPrice?.[0]?.price || 0;
      const priceNgn = Math.ceil(priceUsd * usdToNgnRate);

      return {
        productCode: product.productCode,
        productName: product.productName,
        totalPrice: priceNgn,
        currencyCode: 'NGN',
        estimatedDeliveryDate: product.deliveryCapabilities?.estimatedDeliveryDateAndTime || '',
        estimatedDeliveryDays: product.deliveryCapabilities?.totalTransitDays || 5,
      };
    });

    // Cache the best rate (lowest price)
    const bestRate = rates.sort((a: any, b: any) => a.totalPrice - b.totalPrice)[0];
    if (bestRate) {
      await supabase.from('shipping_rate_cache').insert({
        cart_hash: cartHash,
        destination_country: destinationCountry,
        destination_postal_code: destinationPostalCode || '',
        total_weight_kg: totalWeight,
        rate_ngn: bestRate.totalPrice,
        currency_code: 'NGN',
        service_type: bestRate.productName,
        estimated_days: bestRate.estimatedDeliveryDays,
        dhl_product_code: bestRate.productCode,
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min cache
      });
    }

    return new Response(
      JSON.stringify({
        rates,
        totalWeight,
        cacheHit: false,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('DHL rates error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to get shipping rates',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
