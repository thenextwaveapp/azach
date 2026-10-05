/**
 * DHL Express Create Shipment Edge Function
 * Creates a DHL shipment and generates shipping label
 * Returns tracking number, shipment ID, and label PDF
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendEmail, shippingConfirmationEmail } from '../_shared/email.ts';

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

    // Fetch order details, joined to the products backing each line item so we can
    // pull real weight/dimensions and the customs classification fields (no defaults).
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          product_name,
          product_image,
          quantity,
          price,
          product_id,
          product:products (
            category,
            gender,
            material,
            hs_code,
            weight_kg,
            length_cm,
            width_cm,
            height_cm
          )
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

    // Every line item's product must have weight/dimensions before we can book a shipment at all.
    const missingShippingInfo = order.order_items
      .filter((item: any) => {
        const p = item.product;
        return !p || p.weight_kg == null || p.length_cm == null || p.width_cm == null || p.height_cm == null;
      })
      .map((item: any) => item.product_name);

    if (missingShippingInfo.length > 0) {
      return new Response(
        JSON.stringify({
          error: `Missing weight/dimensions for: ${missingShippingInfo.join(', ')}. Add these in Admin before creating a shipment.`,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const genderLabel: Record<string, string> = {
      men: "Men's",
      women: "Women's",
      unisex: 'Unisex',
    };

    let totalWeight = 0;
    let maxLength = 0;
    let maxWidth = 0;
    let maxHeight = 0;

    for (const orderItem of order.order_items) {
      const p = orderItem.product;
      totalWeight += p.weight_kg * orderItem.quantity;
      maxLength = Math.max(maxLength, p.length_cm);
      maxWidth = Math.max(maxWidth, p.width_cm);
      maxHeight = Math.max(maxHeight, p.height_cm);
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

    // Format date for DHL API: '2010-02-11T17:10:09 GMT+01:00'
    const formatDHLDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');

      // Get timezone offset in hours and minutes
      const offsetMinutes = -date.getTimezoneOffset();
      const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
      const offsetMins = Math.abs(offsetMinutes) % 60;
      const offsetSign = offsetMinutes >= 0 ? '+' : '-';
      const gmtOffset = `GMT${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMins).padStart(2, '0')}`;

      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds} ${gmtOffset}`;
    };

    const plannedShippingDateFormatted = formatDHLDate(plannedShippingDate);

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

    // Handle both full country names and codes
    const countryName = shippingAddress.country || '';
    const countryCode = countryCodeMap[countryName] || (countryName.length === 2 ? countryName.toUpperCase() : countryName.substring(0, 2).toUpperCase());

    const isInternational = countryCode !== 'NG';

    // International shipments need a customs declaration per line item. We refuse to
    // guess a description or commodity code — every product must have these set.
    const itemsForCustoms: any[] = [];
    if (isInternational) {
      const missingCustomsInfo: string[] = [];

      for (const orderItem of order.order_items) {
        const p = orderItem.product;
        const missingFields = [
          !p.category && 'category',
          (!p.gender || p.gender.length === 0) && 'gender',
          !p.material && 'material',
          !p.hs_code && 'HS code',
        ].filter(Boolean);

        if (missingFields.length > 0) {
          missingCustomsInfo.push(`${orderItem.product_name} (missing ${missingFields.join(', ')})`);
          continue;
        }

        const categoryLabel = p.category.charAt(0).toUpperCase() + p.category.slice(1).toLowerCase();
        const itemWeight = p.weight_kg * orderItem.quantity;
        const genderDescription = p.gender.map((g: string) => genderLabel[g] || g).join('/');
        itemsForCustoms.push({
          number: itemsForCustoms.length + 1,
          description: `${genderDescription} ${categoryLabel}, ${p.material}`,
          price: orderItem.price,
          quantity: {
            value: orderItem.quantity,
            unitOfMeasurement: 'PCS',
          },
          commodityCodes: [
            { typeCode: 'outbound', value: p.hs_code },
            { typeCode: 'inbound', value: p.hs_code },
          ],
          exportReasonType: 'permanent',
          manufacturerCountry: 'NG',
          weight: {
            netValue: itemWeight,
            grossValue: itemWeight,
          },
        });
      }

      if (missingCustomsInfo.length > 0) {
        return new Response(
          JSON.stringify({
            error: `Missing customs info for international shipment: ${missingCustomsInfo.join('; ')}. Add these in Admin before creating a shipment.`,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      if (order.total == null || order.shipping_cost == null) {
        return new Response(
          JSON.stringify({
            error: 'Order is missing total/shipping cost, required for the customs declaration.',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
    }

    // Handle both "name" and "fullName" fields
    const customerName = shippingAddress.fullName || shippingAddress.name || '';
    const customerEmail = shippingAddress.email || '';

    if (!shippingAddress.phone) {
      return new Response(
        JSON.stringify({
          error: 'Order is missing a shipping phone number, required by DHL to create a shipment.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    const customerPhone = shippingAddress.phone;

    // Prepare DHL shipment request
    const dhlShipmentRequest = {
      plannedShippingDateAndTime: plannedShippingDateFormatted,
      pickup: {
        isRequested: false, // Can be changed to true to auto-schedule pickup
      },
      // Use domestic product for Nigeria, international for others
      productCode: isInternational ? 'P' : 'N', // N = Domestic 12:00, P = Worldwide
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
            countyName: Deno.env.get('DHL_ORIGIN_STATE') || 'Lagos',
            countryCode: 'NG',
            addressLine1: Deno.env.get('DHL_ORIGIN_ADDRESS') || 'Business Address',
          },
          contactInformation: {
            email: Deno.env.get('DHL_ORIGIN_EMAIL') || 'shipping@azach.com',
            phone: Deno.env.get('DHL_ORIGIN_PHONE') || '+234 XXX XXX XXXX',
            companyName: Deno.env.get('DHL_COMPANY_NAME') || 'AZACH',
            fullName: Deno.env.get('DHL_SHIPPER_NAME') || 'AZACH Shipping',
          },
          typeCode: 'business', // AZACH is the shipping business
        },
        receiverDetails: {
          postalAddress: {
            postalCode: shippingAddress.postalCode || '',
            cityName: shippingAddress.city || '',
            countyName: shippingAddress.state || shippingAddress.city || '',
            countryCode: countryCode,
            addressLine1: shippingAddress.address || '',
          },
          contactInformation: {
            email: customerEmail,
            phone: customerPhone,
            companyName: customerName,
            fullName: customerName,
          },
          typeCode: 'private', // customers are individuals, not businesses
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
        isCustomsDeclarable: isInternational,
        ...(isInternational && {
          declaredValue: order.total,
          declaredValueCurrency: 'NGN',
          exportDeclaration: {
            lineItems: itemsForCustoms,
            invoice: {
              number: order.id.replace(/-/g, '').substring(0, 35), // Remove hyphens, max 35 chars
              date: order.created_at.split('T')[0],
            },
            exportReason: 'Sale of goods',
            exportReasonType: 'permanent',
            placeOfIncoterm: shippingAddress.city || '',
            shipmentType: 'commercial',
            additionalCharges: [
              {
                typeCode: 'freight',
                value: order.shipping_cost,
              },
            ],
          },
          incoterm: 'DAP', // Delivered At Place
        }),
        description: 'Clothing and accessories',
        unitOfMeasurement: 'metric',
      },
      outputImageProperties: {
        allDocumentsInOneImage: true,
        encodingFormat: 'pdf',
        imageOptions: [
          {
            typeCode: 'label',
            templateName: 'ECOM26_84_A4_001',
          },
          {
            typeCode: 'waybillDoc',
            templateName: 'ARCH_8X4_A4_002',
            isRequested: true,
            hideAccountNumber: true,
          },
          // Commercial invoice — required as the 3rd page for international (customs-declarable) shipments
          ...(isInternational
            ? [
                {
                  typeCode: 'invoice',
                  templateName: 'COMMERCIAL_INVOICE_P_10',
                  invoiceType: 'commercial',
                  languageCode: 'eng',
                  isRequested: true,
                },
              ]
            : []),
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
    const invoiceDocument = documents.find((doc: any) => doc.typeCode === 'invoice');

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
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order:', updateError);
      throw new Error('Failed to update order with shipment details');
    }

    if (customerEmail) {
      const currency = order.currency || 'NGN';
      const emailItems = order.order_items.map((i: any) => ({
        name: i.product_name,
        qty: i.quantity,
        price: i.price,
        image: i.product_image,
      }));
      await sendEmail({
        to: customerEmail,
        subject: `Your AZACH Order Has Shipped — ${dhlData.shipmentTrackingNumber}`,
        html: shippingConfirmationEmail({
          customerName: customerName || 'there',
          orderNumber: `#AZ-${order.id.slice(0, 8).toUpperCase()}`,
          trackingNumber: dhlData.shipmentTrackingNumber,
          trackingUrl: `https://www.dhl.com/en/express/tracking.html?AWB=${dhlData.shipmentTrackingNumber}&brand=DHL`,
          items: emailItems,
          totals: {
            subtotal: order.subtotal,
            shipping: order.shipping_cost || 0,
            tax: order.tax || 0,
            total: order.total,
            currency,
          },
        }),
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        trackingNumber: dhlData.shipmentTrackingNumber,
        shipmentId: dhlData.shipmentTrackingNumber,
        labelUrl: labelUrl,
        labelBase64: labelDocument?.content,
        waybillBase64: waybillDocument?.content,
        invoiceBase64: invoiceDocument?.content,
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
