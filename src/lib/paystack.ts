/**
 * Paystack Payment Gateway Integration
 * Handles payment initialization and verification for Nigerian market
 */

import { invokeFunction } from './functionError';

export interface PaystackCheckoutRequest {
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  userId: string;
  userEmail: string;
  currency: string;
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
  shippingCost: number;
  shippingProvider?: 'dhl' | 'topship';
  shippingService?: string;
  discountCode?: string;
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
  userId: string,
  userEmail: string,
  currency: string,
  shippingAddress: PaystackCheckoutRequest['shippingAddress'],
  shippingCost: number,
  discountCode?: string,
  shippingProvider?: 'dhl' | 'topship',
  shippingService?: string
): Promise<PaystackCheckoutResponse> => {
  try {
    const data = await invokeFunction<any>('paystack-initialize', {
      items,
      userId,
      userEmail,
      currency: currency.toUpperCase(),
      shippingAddress,
      shippingCost,
      shippingProvider,
      shippingService,
      discountCode,
      callback_url: `${window.location.origin}/checkout/success`,
    });

    if (!data?.reference) {
      throw new Error('Invalid response from payment server');
    }

    return {
      reference: data.reference,
      access_code: data.access_code,
      authorization_url: data.authorization_url,
    };
  } catch (error) {
    console.error('Paystack error:', error);
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
    const data = await invokeFunction<any>('paystack-verify', { reference });

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
  // Just redirect to Paystack checkout page
  window.location.href = checkoutData.authorization_url;
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
