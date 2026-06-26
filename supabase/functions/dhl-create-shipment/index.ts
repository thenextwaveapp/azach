/**
 * DHL Express Create Shipment Edge Function
 * Creates a DHL shipment and generates shipping label
 * Returns tracking number, shipment ID, and label PDF
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateShipmentRequest {
  orderId: string;
}

interface ShipmentDetails {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  countryCode: string;
  stateOrProvince?: string;
}

interface PackageDetails {
  weight: number; // kg
  length: number; // cm
  width: number; // cm
  height: number; // cm
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    sku?: string;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { orderId }: CreateShipmentRequest = await req.json();

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: 'Order ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          product_name,
          quantity,
          price
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Order fetch error:', orderError);
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Check if shipment already created
    if (order.dhl_tracking_number) {
      return new Response(
        JSON.stringify({
          error: 'Shipment already created for this order',
          trackingNumber: order.dhl_tracking_number,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Calculate total weight and dimensions
    // Using default values since order_items don't link to products table
    const DEFAULT_WEIGHT_KG = 0.5; // 500g per item
    const DEFAULT_LENGTH_CM = 30;
    const DEFAULT_WIDTH_CM = 25;
    const DEFAULT_HEIGHT_CM = 5;

    let totalWeight = 0;
    let maxLength = DEFAULT_LENGTH_CM;
    let maxWidth = DEFAULT_WIDTH_CM;
    let maxHeight = DEFAULT_HEIGHT_CM;
    const itemsForCustoms: any[] = [];

    for (const orderItem of order.order_items) {
      const quantity = orderItem.quantity;
      const itemWeight = DEFAULT_WEIGHT_KG * quantity;

      totalWeight += itemWeight;

      // Add to customs declaration
      itemsForCustoms.push({
        number: itemsForCustoms.length + 1,
        description: orderItem.product_name,
        price: orderItem.price,
        quantity: {
          value: quantity,
          unitOfMeasurement: 'PCS',
        },
        commodityCodes: [
          {
            typeCode: 'outbound',
            value: '6203', // Generic clothing HS code - adjust as needed
          },
        ],
        exportReasonType: 'permanent',
        manufacturerCountry: 'NG',
        weight: {
          netValue: itemWeight,
          grossValue: itemWeight,
        },
      });
    }

    // Ensure minimum weight
    totalWeight = Math.max(totalWeight, 0.1);

    // Prepare shipment date (next business day)
    const plannedShippingDate = new Date();
    plannedShippingDate.setDate(plannedShippingDate.getDate() + 1);

    // Skip weekends - DHL doesn't pickup on Saturday/Sunday
    const dayOfWeek = plannedShippingDate.getDay();
    if (dayOfWeek === 0) { // Sunday
      plannedShippingDate.setDate(plannedShippingDate.getDate() + 1); // Monday
    } else if (dayOfWeek === 6) { // Saturday
      plannedShippingDate.setDate(plannedShippingDate.getDate() + 2); // Monday
    }

    // Parse shipping address (handle both string and object)
    const shippingAddress = typeof order.shipping_address === 'string'
      ? JSON.parse(order.shipping_address || '{}')
      : (order.shipping_address || {});

    // Map full country names to ISO 2-letter codes
    const countryCodeMap: Record<string, string> = {
      'Nigeria': 'NG',
      'United States': 'US',
      'United Kingdom': 'GB',
      'Canada': 'CA',
      'Ghana': 'GH',
      'Kenya': 'KE',
      'South Africa': 'ZA',
      'United Arab Emirates': 'AE',
      'Australia': 'AU',
      'France': 'FR',
      'Germany': 'DE',
      'India': 'IN',
      'Italy': 'IT',
      'Japan': 'JP',
      'Netherlands': 'NL',
      'Spain': 'ES',
      'Switzerland': 'CH',
    };

    const countryName = shippingAddress.country || '';
    const countryCode = countryCodeMap[countryName] || countryName.substring(0, 2).toUpperCase();

    // Prepare DHL shipment request
    const dhlShipmentRequest = {
      plannedShippingDateAndTime: plannedShippingDate.toISOString(),
      pickup: {
        isRequested: false, // Can be changed to true to auto-schedule pickup
      },
      productCode: order.shipping_service_code || 'P', // P = Express Worldwide
      accounts: [
        {
          typeCode: 'shipper',
          number: Deno.env.get('DHL_ACCOUNT_NUMBER'),
        },
      ],
      customerDetails: {
        shipperDetails: {
          postalAddress: {
            postalCode: Deno.env.get('DHL_ORIGIN_POSTAL_CODE') || '100001',
            cityName: Deno.env.get('DHL_ORIGIN_CITY') || 'Lagos',
            countryCode: 'NG',
            addressLine1: Deno.env.get('DHL_ORIGIN_ADDRESS') || 'Business Address',
          },
          contactInformation: {
            email: Deno.env.get('DHL_ORIGIN_EMAIL') || 'shipping@azach.com',
            phone: Deno.env.get('DHL_ORIGIN_PHONE') || '+234 XXX XXX XXXX',
            companyName: Deno.env.get('DHL_COMPANY_NAME') || 'AZACH',
            fullName: Deno.env.get('DHL_SHIPPER_NAME') || 'AZACH Shipping',
          },
        },
        receiverDetails: {
          postalAddress: {
            postalCode: shippingAddress.postalCode || '',
            cityName: shippingAddress.city || '',
            countryCode: countryCode,
            addressLine1: shippingAddress.address || '',
          },
          contactInformation: {
            email: shippingAddress.email || '',
            phone: shippingAddress.phone || '',
            companyName: shippingAddress.name || '',
            fullName: shippingAddress.name || '',
          },
        },
      },
      content: {
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
        isCustomsDeclarable: countryCode !== 'NG',
        ...(countryCode !== 'NG' && {
          declaredValue: order.total || 0,
          declaredValueCurrency: 'NGN',
          exportDeclaration: {
            lineItems: itemsForCustoms,
            invoice: {
              number: order.id,
              date: order.created_at.split('T')[0],
            },
            exportReason: 'Sale of goods',
            exportReasonType: 'permanent',
          },
          incoterm: 'DAP', // Delivered At Place
        }),
        description: 'Clothing and accessories',
        unitOfMeasurement: 'metric',
      },
      outputImageProperties: {
        imageOptions: [
          {
            typeCode: 'label',
            templateName: 'ECOM26_84_001', // 4x6 label format
            isRequested: true,
          },
          {
            typeCode: 'waybillDoc',
            templateName: 'ARCH_8X4', // Waybill
            isRequested: true,
          },
        ],
      },
    };

    // Call DHL API
    const dhlApiKey = Deno.env.get('DHL_API_KEY');
    const dhlApiSecret = Deno.env.get('DHL_API_SECRET');

    if (!dhlApiKey || !dhlApiSecret) {
      throw new Error('DHL API credentials not configured');
    }

    const authString = btoa(`${dhlApiKey}:${dhlApiSecret}`);
    const dhlApiUrl = Deno.env.get('DHL_API_URL') || 'https://express.api.dhl.com/mydhlapi/test';

    console.log('Creating DHL shipment for order:', orderId);

    const dhlResponse = await fetch(`${dhlApiUrl}/shipments`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authString}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dhlShipmentRequest),
    });

    if (!dhlResponse.ok) {
      const errorText = await dhlResponse.text();
      console.error('DHL API error:', dhlResponse.status, errorText);
      throw new Error(`DHL API error: ${errorText}`);
    }

    const dhlData = await dhlResponse.json();
    console.log('DHL shipment created successfully:', dhlData.shipmentTrackingNumber);

    // Extract label and documents
    const documents = dhlData.documents || [];
    const labelDocument = documents.find((doc: any) => doc.typeCode === 'label');
    const waybillDocument = documents.find((doc: any) => doc.typeCode === 'waybillDoc');

    // Store label PDF in Supabase Storage
    let labelUrl = null;
    if (labelDocument && labelDocument.content) {
      const labelBuffer = Uint8Array.from(atob(labelDocument.content), (c) => c.charCodeAt(0));
      const labelFileName = `${orderId}_label.pdf`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('shipping-labels')
        .upload(labelFileName, labelBuffer, {
          contentType: 'application/pdf',
          upsert: true,
        });

      if (uploadError) {
        console.error('Error uploading label:', uploadError);
      } else {
        const { data: urlData } = supabase.storage
          .from('shipping-labels')
          .getPublicUrl(labelFileName);
        labelUrl = urlData.publicUrl;
      }
    }

    // Update order with shipment details
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        dhl_tracking_number: dhlData.shipmentTrackingNumber,
        dhl_shipment_id: dhlData.shipmentTrackingNumber, // Same as tracking for DHL
        dhl_label_url: labelUrl,
        shipping_status: 'label_created',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order:', updateError);
      throw new Error('Failed to update order with shipment details');
    }

    return new Response(
      JSON.stringify({
        success: true,
        trackingNumber: dhlData.shipmentTrackingNumber,
        shipmentId: dhlData.shipmentTrackingNumber,
        labelUrl: labelUrl,
        labelBase64: labelDocument?.content,
        waybillBase64: waybillDocument?.content,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('DHL create shipment error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to create shipment',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
