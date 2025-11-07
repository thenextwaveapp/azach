import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

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

    if (!stripeKey) {
      console.error('STRIPE_SECRET_KEY not found in environment')
      throw new Error('Stripe key not configured')
    }

    console.log('Stripe key exists, first 7 chars:', stripeKey.substring(0, 7))

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    })

    const { items, successUrl, cancelUrl, userEmail, currency = 'usd', shippingAddress } = await req.json()
    console.log('Creating checkout session for', items.length, 'items', 'in', currency.toUpperCase())

    if (!items || items.length === 0) {
      throw new Error('No items provided')
    }

    // Transform cart items into Stripe line items
    const lineItems = items.map((item: any) => {
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
