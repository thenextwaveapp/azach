import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { sendEmail, orderConfirmationEmail, internalNewOrderEmail, OPS_EMAIL } from '../_shared/email.ts'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

async function sendOrderEmails(order: any, orderItems: any[], shippingAddress: any) {
  const currency = 'NGN'
  const totals = {
    subtotal: order.subtotal,
    shipping: order.shipping_cost || 0,
    tax: order.tax || 0,
    total: order.total,
    currency,
  }
  const emailItems = orderItems.map((i: any) => ({ name: i.product_name, qty: i.quantity, price: i.price, image: i.product_image }))
  const orderNumber = `#AZ-${order.id.slice(0, 8).toUpperCase()}`
  const orderDate = new Date(order.created_at || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
  const customerName = shippingAddress?.fullName || shippingAddress?.name || 'there'
  const customerEmail = shippingAddress?.email

  const tasks: Promise<void>[] = []

  if (customerEmail) {
    tasks.push(
      sendEmail({
        to: customerEmail,
        subject: `Order Confirmed — ${orderNumber}`,
        html: orderConfirmationEmail({ customerName, orderNumber, orderDate, items: emailItems, totals }),
      })
    )
  }

  tasks.push(
    sendEmail({
      to: OPS_EMAIL,
      subject: `New Order Received — ${orderNumber}`,
      html: internalNewOrderEmail({
        orderNumber,
        orderDate,
        customer: {
          name: customerName,
          email: customerEmail || 'unknown',
          phone: shippingAddress?.phone,
          country: shippingAddress?.country,
        },
        shippingAddress: [
          shippingAddress?.address,
          shippingAddress?.city,
          shippingAddress?.state,
          shippingAddress?.postalCode,
          shippingAddress?.country,
        ].filter(Boolean).join(', '),
        items: emailItems,
        totals,
      }),
    })
  )

  await Promise.all(tasks)
}

serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      return new Response(JSON.stringify({ error: 'No signature' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const body = await req.text()
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

    if (!webhookSecret) {
      return new Response(JSON.stringify({ error: 'Webhook secret not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Verify webhook signature (use async version for Deno)
    let event
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message)
      return new Response(JSON.stringify({ error: 'Webhook signature verification failed' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      // Initialize Supabase client with service role key for admin access
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )

      // Parse cart items from metadata
      const cartItems = JSON.parse(session.metadata?.cartItems || '[]')

      if (!cartItems || cartItems.length === 0) {
        console.error('No cart items in session metadata')
        return new Response('No cart items', { status: 400 })
      }

      // Parse shipping address from metadata
      const shippingAddress = session.metadata?.shippingAddress
        ? JSON.parse(session.metadata.shippingAddress)
        : null

      // Calculate totals
      const subtotal = cartItems.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0
      )
      const total = session.amount_total ? session.amount_total / 100 : subtotal

      // Get user ID from customer email if available
      let userId = null
      if (session.customer_email) {
        const { data: userData } = await supabaseAdmin
          .from('auth.users')
          .select('id')
          .eq('email', session.customer_email)
          .single()
        userId = userData?.id
      }

      // Create order
      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert({
          user_id: userId,
          status: 'processing',
          payment_status: 'paid',
          total: total,
          subtotal: subtotal,
          stripe_session_id: session.id,
          stripe_payment_intent_id: session.payment_intent as string,
          shipping_address: shippingAddress,
        })
        .select()
        .single()

      if (orderError) {
        console.error('Error creating order:', orderError)
        throw orderError
      }

      // Create order items
      const orderItems = cartItems.map((item: any) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        product_image: item.image,
        price: item.price,
        quantity: item.quantity,
      }))

      const { error: itemsError } = await supabaseAdmin
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        console.error('Error creating order items:', itemsError)
        throw itemsError
      }

      // Update product stock. Bundle/set products have their stock computed from
      // components, so this decrements the underlying component pieces instead.
      for (const item of cartItems) {
        const { error: stockError } = await supabaseAdmin.rpc('decrement_stock_for_purchase', {
          p_product_id: item.id,
          p_quantity: item.quantity
        })

        if (stockError) {
          console.error('Error decrementing stock for', item.id, stockError)
        }
      }

      console.log('Order created successfully:', order.id)

      await sendOrderEmails(order, orderItems, shippingAddress)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
