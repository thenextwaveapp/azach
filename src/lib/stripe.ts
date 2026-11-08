/**
 * Stripe Payment Gateway Integration
 * Creates a Stripe Checkout Session via edge function and redirects to Stripe's hosted
 * page, then verifies the session on the success page. Charges are always in USD — the
 * Stripe account cannot settle NGN — regardless of the currency the visitor browses in.
 */

import { invokeFunction } from './functionError';

export interface StripeCheckoutRequest {
  items: Array<{
    id: string;
    name: string;
    price: number; // USD
    quantity: number;
    image: string;
    size?: string;
  }>;
  userId: string;
  userEmail: string;
  shippingAddress: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  shippingCost: number; // USD
  shippingProvider?: 'dhl' | 'topship';
  shippingService?: string;
  discountCode?: string;
}

export interface StripeCheckoutResponse {
  sessionId: string;
  url: string;
}

export interface StripeVerificationResponse {
  status: string;
  sessionId: string;
  amount: number; // cents
  currency: string;
  order_id?: string;
}

/**
 * Create a Stripe Checkout Session and get back its hosted-page URL.
 */
export const createStripeCheckout = async (
  items: StripeCheckoutRequest['items'],
  userId: string,
  userEmail: string,
  shippingAddress: StripeCheckoutRequest['shippingAddress'],
  shippingCost: number,
  discountCode?: string,
  shippingProvider?: 'dhl' | 'topship',
  shippingService?: string
): Promise<StripeCheckoutResponse> => {
  try {
    const data = await invokeFunction<{ sessionId: string; url: string }>('stripe-create-checkout', {
      items,
      userId,
      userEmail,
      shippingAddress,
      shippingCost,
      shippingProvider,
      shippingService,
      discountCode,
      successUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${window.location.origin}/cart`,
    });

    if (!data?.url) {
      throw new Error('Invalid response from payment server');
    }

    return { sessionId: data.sessionId, url: data.url };
  } catch (error) {
    console.error('Stripe error:', error);
    throw error;
  }
};

/**
 * Redirect the browser to the Stripe-hosted checkout page.
 */
export const redirectToStripeCheckout = (checkout: StripeCheckoutResponse): void => {
  window.location.href = checkout.url;
};

/**
 * Verify a Stripe Checkout Session.
 * Called on the success page to confirm payment and ensure the order was recorded.
 */
export const verifyStripeCheckout = async (
  sessionId: string
): Promise<StripeVerificationResponse> => {
  try {
    const data = await invokeFunction<StripeVerificationResponse>('stripe-verify', { sessionId });

    if (!data || data.status !== 'success') {
      throw new Error('Payment verification failed');
    }

    return data;
  } catch (error) {
    console.error('Error verifying Stripe session:', error);
    throw error;
  }
};
