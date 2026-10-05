/**
 * Topship Create Shipment Edge Function
 * Books a Topship shipment for an order: re-quotes the rate, saves the shipment as a
 * draft (/save-shipment), then pays for it from the AZACH Topship wallet (/pay-from-wallet).
 * If wallet payment fails (e.g. insufficient balance), the draft id is kept on the order so
 * a retry pays for the existing draft instead of booking a duplicate.
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

// Topship rejects address lines over 45 chars — split on word boundaries across up to 3 lines.
const splitAddressLines = (address: string): [string, string, string] => {
  const words = (address || '').trim().split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= 45) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word.slice(0, 45);
    }
  }
  if (current) lines.push(current);

  return [lines[0] || '', lines[1] || '', lines[2] || ''];
};

serve(async (req) => {
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

    const apiKey = Deno.env.get('TOPSHIP_API_KEY');
    if (!apiKey) {
      throw new Error('Topship API key not configured');
    }
    const apiUrl = Deno.env.get('TOPSHIP_API_URL') || 'https://topship-staging.africa/api';

    const topshipFetch = async (path: string, init?: RequestInit) => {
      const response = await fetch(`${apiUrl}${path}`, {
        ...init,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          ...(init?.headers || {}),
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Topship API error on ${path}:`, response.status, errorText);
        let message = errorText;
        try {
          const parsed = JSON.parse(errorText);
          message = parsed.message || parsed.error || errorText;
        } catch { /* raw text is fine */ }
        throw new Error(`Topship API error: ${message}`);
      }
      return response.json();
    };

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

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
          product:products ( weight_kg )
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

    if (order.topship_tracking_id) {
      return new Response(
        JSON.stringify({
          error: 'Shipment already created for this order',
          trackingNumber: order.topship_tracking_id,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const missingWeight = order.order_items
      .filter((item: any) => !item.product || item.product.weight_kg == null)
      .map((item: any) => item.product_name);

    if (missingWeight.length > 0) {
      return new Response(
        JSON.stringify({
          error: `Missing weight for: ${missingWeight.join(', ')}. Add these in Admin before creating a shipment.`,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const shippingAddress = typeof order.shipping_address === 'string'
      ? JSON.parse(order.shipping_address || '{}')
      : (order.shipping_address || {});

    const countryName = shippingAddress.country || '';
    const countryCode = countryCodeMap[countryName] || (countryName.length === 2 ? countryName.toUpperCase() : countryName.substring(0, 2).toUpperCase());

    const customerName = shippingAddress.fullName || shippingAddress.name || '';
    const customerEmail = shippingAddress.email || '';
    const customerPhone = shippingAddress.phone;

    if (!customerPhone) {
      return new Response(
        JSON.stringify({ error: 'Order is missing a shipping phone number, required by Topship.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    let shipmentId = order.topship_shipment_id as string | null;

    // Only build and save a new draft if a previous attempt didn't already leave one behind.
    if (!shipmentId) {
      const totalWeight = Math.max(
        order.order_items.reduce(
          (sum: number, item: any) => sum + item.product.weight_kg * item.quantity,
          0
        ),
        0.1
      );

      // Re-quote to get the authoritative shipmentCharge (Topship requires the charge
      // to come verbatim from /get-shipment-rate).
      const shipmentDetail = {
        senderDetails: {
          cityName: Deno.env.get('TOPSHIP_ORIGIN_CITY') || 'Lagos',
          countryCode: 'NG',
        },
        receiverDetails: {
          cityName: shippingAddress.city || '',
          countryCode,
        },
        totalWeight,
      };

      const quotes = await topshipFetch(
        `/get-shipment-rate?shipmentDetail=${encodeURIComponent(JSON.stringify(shipmentDetail))}`
      );

      const usableQuotes = (Array.isArray(quotes) ? quotes : []).filter(
        (q: any) => !q.isDisabled && q.cost > 0
      );
      if (usableQuotes.length === 0) {
        throw new Error('No Topship rates available for this destination');
      }

      // Prefer the tier the customer paid for at checkout; fall back to the cheapest.
      const quote =
        usableQuotes.find((q: any) => q.pricingTier === order.shipping_service) ||
        usableQuotes.sort((a: any, b: any) => a.cost - b.cost)[0];

      const [senderLine1, senderLine2, senderLine3] = splitAddressLines(
        Deno.env.get('TOPSHIP_ORIGIN_ADDRESS') || Deno.env.get('DHL_ORIGIN_ADDRESS') || 'Lagos'
      );
      const [receiverLine1, receiverLine2, receiverLine3] = splitAddressLines(shippingAddress.address || '');

      const shipmentCharge = quote.cost; // kobo
      const valueAddedTaxCharge = Math.ceil(shipmentCharge * 0.075);

      const savePayload = {
        shipment: [
          {
            items: order.order_items.map((item: any) => ({
              category: 'ClothingAndTextile',
              description: item.product_name,
              weight: item.product.weight_kg * item.quantity,
              quantity: item.quantity,
              value: Math.round((item.price || 0) * 100), // kobo
            })),
            itemCollectionMode: 'DropOff',
            pricingTier: quote.pricingTier,
            insuranceType: 'None',
            insuranceCharge: 0,
            discount: 0,
            shipmentRoute: countryCode === 'NG' ? 'Domestic' : 'Export',
            shipmentCharge,
            pickupCharge: 0,
            valueAddedTaxCharge,
            senderDetail: {
              name: Deno.env.get('TOPSHIP_SENDER_NAME') || Deno.env.get('DHL_COMPANY_NAME') || 'AZACH Creative Company',
              email: Deno.env.get('TOPSHIP_SENDER_EMAIL') || Deno.env.get('DHL_ORIGIN_EMAIL') || 'azachng@gmail.com',
              phoneNumber: Deno.env.get('TOPSHIP_SENDER_PHONE') || Deno.env.get('DHL_ORIGIN_PHONE') || '',
              addressLine1: senderLine1,
              addressLine2: senderLine2,
              addressLine3: senderLine3,
              country: 'Nigeria',
              state: Deno.env.get('TOPSHIP_ORIGIN_STATE') || Deno.env.get('DHL_ORIGIN_STATE') || 'Lagos',
              city: Deno.env.get('TOPSHIP_ORIGIN_CITY') || 'Lagos',
              countryCode: 'NG',
              postalCode: Deno.env.get('TOPSHIP_ORIGIN_POSTAL_CODE') || Deno.env.get('DHL_ORIGIN_POSTAL_CODE') || '100001',
            },
            receiverDetail: {
              name: customerName,
              email: customerEmail,
              phoneNumber: customerPhone,
              addressLine1: receiverLine1,
              addressLine2: receiverLine2,
              addressLine3: receiverLine3,
              country: countryName,
              state: shippingAddress.state || shippingAddress.city || '',
              city: shippingAddress.city || '',
              countryCode,
              postalCode: shippingAddress.postalCode || '',
            },
          },
        ],
      };

      console.log('Saving Topship draft shipment for order:', orderId);
      const saved = await topshipFetch('/save-shipment', {
        method: 'POST',
        body: JSON.stringify(savePayload),
      });

      const draft = Array.isArray(saved) ? saved[0] : saved;
      shipmentId = draft?.id;
      if (!shipmentId) {
        console.error('Unexpected save-shipment response:', JSON.stringify(saved));
        throw new Error('Topship did not return a shipment id');
      }

      // Persist the draft id immediately so a wallet-payment failure below is retryable
      // without creating a duplicate draft.
      await supabase
        .from('orders')
        .update({ topship_shipment_id: shipmentId, updated_at: new Date().toISOString() })
        .eq('id', orderId);
    } else {
      console.log('Reusing existing Topship draft for order:', orderId, shipmentId);
    }

    let paid;
    try {
      paid = await topshipFetch('/pay-from-wallet', {
        method: 'POST',
        body: JSON.stringify({ detail: { shipmentId } }),
      });
    } catch (payError) {
      const message = payError instanceof Error ? payError.message : String(payError);
      return new Response(
        JSON.stringify({
          error: `Draft shipment saved (${shipmentId}) but wallet payment failed: ${message}. Fund the Topship wallet and retry — the draft will be reused.`,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const trackingId = paid?.trackingId;
    const trackingUrl = paid?.trackingUrl || (trackingId ? `https://topship.africa/tracking?trackingId=${trackingId}` : null);
    const labelUrl = paid?.label || null;

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        shipping_provider: 'topship',
        topship_shipment_id: shipmentId,
        topship_tracking_id: trackingId,
        topship_tracking_url: trackingUrl,
        topship_label_url: labelUrl,
        ...(paid?.estimatedDeliveryDate && { estimated_delivery_date: paid.estimatedDeliveryDate }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order:', updateError);
      throw new Error('Shipment booked but failed to update order with shipment details');
    }

    if (customerEmail && trackingId) {
      const currency = order.currency || 'NGN';
      const emailItems = order.order_items.map((i: any) => ({
        name: i.product_name,
        qty: i.quantity,
        price: i.price,
        image: i.product_image,
      }));
      await sendEmail({
        to: customerEmail,
        subject: `Your AZACH Order Has Shipped — ${trackingId}`,
        html: shippingConfirmationEmail({
          customerName: customerName || 'there',
          orderNumber: `#AZ-${order.id.slice(0, 8).toUpperCase()}`,
          trackingNumber: trackingId,
          trackingUrl: trackingUrl || '',
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
        trackingNumber: trackingId,
        shipmentId,
        trackingUrl,
        labelUrl,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Topship create shipment error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to create shipment',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
