/**
 * Paystack Payment Gateway Integration
 * Handles payment initialization and verification for Nigerian market
 */

import { supabase } from './supabase';

export interface PaystackCheckoutRequest {
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  userEmail: string;
  currency: string;
  shippingAddress: {
    fullName: string;
    email: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  shippingCost: number;
}

export interface PaystackCheckoutResponse {
  reference: string;
  access_code: string;
  authorization_url: string;
}

export interface PaystackVerificationResponse {
  status: string;
  reference: string;
  amount: number;
  currency: string;
  transaction_date: string;
  order_id?: string;
}

/**
 * Initialize a Paystack payment transaction
 * Creates a checkout session and reserves stock for 15 minutes
 */
export const initializePaystackTransaction = async (
  items: PaystackCheckoutRequest['items'],
  userEmail: string,
  currency: string,
  shippingAddress: PaystackCheckoutRequest['shippingAddress'],
  shippingCost: number
): Promise<PaystackCheckoutResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('paystack-initialize', {
      body: {
        items,
        userEmail,
        currency: currency.toUpperCase(),
        shippingAddress,
        shippingCost,
        callback_url: `${window.location.origin}/checkout/success`,
      },
    });

    if (error) {
      console.error('Paystack initialization error:', error);
      console.error('Error details:', JSON.stringify(error));
      throw new Error(error.message || 'Failed to initialize payment');
    }

    // Check if function returned an error in the response
    if (data && data.error) {
      console.error('Paystack API returned error:', data.error);
      throw new Error(data.error);
    }

    if (!data || !data.reference) {
      console.error('Invalid response data:', data);
      throw new Error('Invalid response from payment server');
    }

    return {
      reference: data.reference,
      access_code: data.access_code,
      authorization_url: data.authorization_url,
    };
  } catch (error) {
    console.error('Error initializing Paystack transaction:', error);
    throw error;
  }
};

/**
 * Verify a Paystack payment transaction
 * Called on the success page to confirm payment was successful
 */
export const verifyPaystackTransaction = async (
  reference: string
): Promise<PaystackVerificationResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('paystack-verify', {
      body: { reference },
    });

    if (error) {
      console.error('Paystack verification error:', error);
      throw new Error(error.message || 'Failed to verify payment');
    }

    if (!data || data.status !== 'success') {
      throw new Error('Payment verification failed');
    }

    return data;
  } catch (error) {
    console.error('Error verifying Paystack transaction:', error);
    throw error;
  }
};

/**
 * Open Paystack payment popup
 * Uses Paystack Inline JS for seamless checkout experience
 */
export const openPaystackPopup = (
  checkoutData: PaystackCheckoutResponse,
  email: string,
  amount: number,
  onSuccess: (reference: string) => void,
  onClose: () => void
): void => {
  // Check if Paystack Inline JS is loaded
  if (typeof (window as any).PaystackPop === 'undefined') {
    console.error('Paystack Inline JS not loaded');
    // Fallback to redirect
    window.location.href = checkoutData.authorization_url;
    return;
  }

  const handler = (window as any).PaystackPop.setup({
    key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    email: email,
    amount: amount * 100, // Convert to kobo (smallest currency unit)
    ref: checkoutData.reference,
    callback: (response: any) => {
      onSuccess(response.reference);
    },
    onClose: () => {
      console.log('Payment popup closed');
      onClose();
    },
  });

  handler.openIframe();
};

/**
 * Load Paystack Inline JS script
 * Call this in your app initialization to ensure Paystack is available
 */
export const loadPaystackScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof (window as any).PaystackPop !== 'undefined') {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Paystack script'));
    document.head.appendChild(script);
  });
};
