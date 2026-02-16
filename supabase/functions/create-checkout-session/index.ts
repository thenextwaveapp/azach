import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!stripeKey) {
      console.error('STRIPE_SECRET_KEY not found in environment')
      throw new Error('Stripe key not configured')
    }

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured')
    }

    console.log('Stripe key exists, first 7 chars:', stripeKey.substring(0, 7))

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    })

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

    const { items, successUrl, cancelUrl, userEmail, currency = 'usd', shippingAddress } = await req.json()
    console.log('Creating checkout session for', items.length, 'items', 'in', currency.toUpperCase())

    if (!items || items.length === 0) {
      throw new Error('No items provided')
    }

    // Generate a temporary session ID for stock reservation
    const tempSessionId = crypto.randomUUID()

    // Reserve stock for all items
    for (const item of items) {
      // Skip shipping line items
      if (item.id === 'shipping') continue

      const { data, error } = await supabaseAdmin.rpc('reserve_stock', {
        p_product_id: item.id,
        p_quantity: item.quantity,
        p_session_id: tempSessionId,
        p_duration_minutes: 15 // 15 minute reservation
      })

      if (error || !data) {
        // Reservation failed, release any successful reservations
        await supabaseAdmin.rpc('release_reservation', {
          p_session_id: tempSessionId
        })

        throw new Error(`Insufficient stock for ${item.name}`)
      }
    }

    // Server-side shipping calculation
    const FREE_SHIPPING_THRESHOLD = 3
    const SHIPPING_COST_CAD = 15

    // Count actual product items (exclude shipping)
    const productItems = items.filter((item: any) => item.id !== 'shipping')
    const totalProductQuantity = productItems.reduce((sum: number, item: any) => sum + item.quantity, 0)

    // Calculate server-side shipping cost
    const isFreeShipping = totalProductQuantity >= FREE_SHIPPING_THRESHOLD
    const serverShippingCost = isFreeShipping ? 0 : SHIPPING_COST_CAD

    // Find shipping item sent by client
    const clientShippingItem = items.find((item: any) => item.id === 'shipping')
    const clientShippingCost = clientShippingItem ? clientShippingItem.price : 0

    // Validate shipping cost (allow small rounding differences for currency conversion)
    if (Math.abs(clientShippingCost - serverShippingCost) > 1) {
      throw new Error('Invalid shipping cost')
    }

    // Transform cart items into Stripe line items (exclude client shipping item)
    const lineItems = productItems.map((item: any) => {
      const productData: any = {
        name: item.name,
        description: item.category,
      }

      // Only include images if the image URL is not empty
      if (item.image && item.image.trim() !== '') {
        productData.images = [item.image]
      }

      return {
        price_data: {
          currency: currency,
          product_data: productData,
          unit_amount: Math.round(item.price * 100), // Stripe uses cents
        },
        quantity: item.quantity,
      }
    })

    // Add server-calculated shipping as line item
    if (serverShippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: currency,
          product_data: {
            name: 'Shipping',
            description: 'Standard shipping',
          },
          unit_amount: Math.round(serverShippingCost * 100),
        },
        quantity: 1,
      })
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: userEmail || undefined,
      metadata: {
        // Store only essential cart data (without image URLs to avoid 500 char limit)
        cartItems: JSON.stringify(items.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          category: item.category,
        }))),
        // Store shipping address if provided
        shippingAddress: shippingAddress ? JSON.stringify(shippingAddress) : undefined,
        // Store reservation session ID for cleanup
        reservationSessionId: tempSessionId,
      },
    })

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Checkout session error:', error)
    return new Response(
      JSON.stringify({ error: error.message, details: error.toString() }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
