/**
 * DHL Express Shipping Integration
 * Handles shipping rate calculation and tracking for global shipments from Nigeria
 */

import { supabase } from './supabase';

export interface DHLRateRequest {
  destinationCountry: string;
  destinationPostalCode?: string;
  destinationCity?: string;
  items: Array<{
    id: string;
    quantity: number;
  }>;
}

export interface DHLShippingRate {
  productCode: string;
  productName: string;
  totalPrice: number;
  currencyCode: string;
  estimatedDeliveryDate: string;
  estimatedDeliveryDays: number;
}

export interface DHLRateResponse {
  rates: DHLShippingRate[];
  totalWeight: number;
  cacheHit: boolean;
}

export interface DHLTrackingInfo {
  trackingNumber: string;
  status: string;
  estimatedDelivery: string;
  events: Array<{
    timestamp: string;
    location: string;
    description: string;
  }>;
}

/**
 * Get shipping rates from DHL Express
 * Calculates rates based on cart weight and destination
 * Results are cached for 30 minutes to reduce API calls
 */
export const getDHLRates = async (
  request: DHLRateRequest
): Promise<DHLRateResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('dhl-get-rates', {
      body: {
        destinationCountry: request.destinationCountry,
        destinationPostalCode: request.destinationPostalCode,
        destinationCity: request.destinationCity,
        items: request.items,
      },
    });

    if (error) {
      console.error('DHL rates error:', error);
      throw new Error(error.message || 'Failed to get shipping rates');
    }

    if (!data || !data.rates || data.rates.length === 0) {
      throw new Error('No shipping rates available for this destination');
    }

    return {
      rates: data.rates,
      totalWeight: data.totalWeight,
      cacheHit: data.cacheHit || false,
    };
  } catch (error) {
    console.error('Error getting DHL rates:', error);
    throw error;
  }
};

/**
 * Get cached shipping rate if available
 * Checks local cache before making API call
 */
export const getCachedShippingRate = (
  cartHash: string,
  destinationCountry: string,
  destinationPostalCode?: string
): DHLShippingRate | null => {
  const cacheKey = `dhl_rate_${cartHash}_${destinationCountry}_${destinationPostalCode || ''}`;
  const cached = sessionStorage.getItem(cacheKey);

  if (!cached) return null;

  try {
    const { rate, expiry } = JSON.parse(cached);
    if (Date.now() > expiry) {
      sessionStorage.removeItem(cacheKey);
      return null;
    }
    return rate;
  } catch {
    return null;
  }
};

/**
 * Cache shipping rate in session storage
 * Expires after 30 minutes
 */
export const cacheShippingRate = (
  cartHash: string,
  destinationCountry: string,
  destinationPostalCode: string | undefined,
  rate: DHLShippingRate
): void => {
  const cacheKey = `dhl_rate_${cartHash}_${destinationCountry}_${destinationPostalCode || ''}`;
  const expiry = Date.now() + 30 * 60 * 1000; // 30 minutes

  sessionStorage.setItem(
    cacheKey,
    JSON.stringify({
      rate,
      expiry,
    })
  );
};

/**
 * Calculate cart hash for caching
 * Creates a unique identifier based on cart contents
 */
export const calculateCartHash = (
  items: Array<{ id: string; quantity: number }>
): string => {
  const cartString = items
    .map((item) => `${item.id}-${item.quantity}`)
    .sort()
    .join('|');

  // Simple hash function (for production, consider using a proper hash library)
  let hash = 0;
  for (let i = 0; i < cartString.length; i++) {
    const char = cartString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return Math.abs(hash).toString(36);
};

/**
 * Track DHL shipment
 * Gets current status and tracking history
 */
export const trackDHLShipment = async (
  trackingNumber: string
): Promise<DHLTrackingInfo> => {
  try {
    const { data, error } = await supabase.functions.invoke('dhl-track-shipment', {
      body: { trackingNumber },
    });

    if (error) {
      console.error('DHL tracking error:', error);
      throw new Error(error.message || 'Failed to track shipment');
    }

    if (!data) {
      throw new Error('No tracking information available');
    }

    return data;
  } catch (error) {
    console.error('Error tracking DHL shipment:', error);
    throw error;
  }
};

/**
 * Format DHL service name for display
 * Converts DHL product codes to user-friendly names
 */
export const formatServiceName = (productCode: string): string => {
  const serviceNames: Record<string, string> = {
    'P': 'DHL Express Worldwide',
    'Q': 'DHL Express 12:00',
    'T': 'DHL Express 10:30',
    'U': 'DHL Express Domestic',
    'Y': 'DHL Express 9:00',
    'N': 'DHL Express Domestic 12:00',
  };

  return serviceNames[productCode] || productCode;
};

/**
 * Estimate delivery date range
 * Returns a formatted string like "June 24-26, 2026"
 */
export const formatDeliveryEstimate = (
  estimatedDays: number,
  fromDate: Date = new Date()
): string => {
  const minDate = new Date(fromDate);
  minDate.setDate(minDate.getDate() + estimatedDays);

  const maxDate = new Date(minDate);
  maxDate.setDate(maxDate.getDate() + 1); // Add 1 day buffer

  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };

  if (minDate.getMonth() === maxDate.getMonth()) {
    return `${minDate.toLocaleDateString('en-US', { month: 'short' })} ${minDate.getDate()}-${maxDate.getDate()}, ${minDate.getFullYear()}`;
  }

  return `${minDate.toLocaleDateString('en-US', options)} - ${maxDate.toLocaleDateString('en-US', options)}`;
};
