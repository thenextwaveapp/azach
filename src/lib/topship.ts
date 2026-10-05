/**
 * Topship Shipping Integration
 * Handles shipping rate calculation, shipment booking and tracking via Topship,
 * mirroring the DHL integration in ./dhl.ts. Rates are quoted on city + country +
 * weight (no postal code required) and returned in NGN.
 */

import { invokeFunction } from './functionError';

export interface TopshipRateRequest {
  destinationCountry: string;
  destinationCity: string;
  items: Array<{
    id: string;
    quantity: number;
  }>;
}

export interface TopshipShippingRate {
  pricingTier: string;
  mode: string;
  totalPrice: number;
  currencyCode: string;
  duration: string;
  estimatedDeliveryDate: string;
  isRecommended: boolean;
}

export interface TopshipRateResponse {
  rates: TopshipShippingRate[];
  totalWeight: number;
}

export interface TopshipCreateShipmentResponse {
  success: boolean;
  trackingNumber: string;
  shipmentId: string;
  trackingUrl: string | null;
  labelUrl: string | null;
}

export interface TopshipTrackingInfo {
  trackingId: string;
  status: string;
  statusDescription: string;
  currentLocation: string;
  transshipmentPoint: string;
  estimatedDelivery: string;
  origin: string;
  destination: string;
}

export const getTopshipRates = async (
  request: TopshipRateRequest
): Promise<TopshipRateResponse> => {
  try {
    const data = await invokeFunction<any>('topship-get-rates', {
      destinationCountry: request.destinationCountry,
      destinationCity: request.destinationCity,
      items: request.items,
    });

    if (!data || !data.rates || data.rates.length === 0) {
      throw new Error('No Topship rates available for this destination');
    }

    return {
      rates: data.rates,
      totalWeight: data.totalWeight,
    };
  } catch (error) {
    console.error('Error getting Topship rates:', error);
    throw error;
  }
};

export const createTopshipShipment = async (
  orderId: string
): Promise<TopshipCreateShipmentResponse> => {
  try {
    const data = await invokeFunction<any>('topship-create-shipment', { orderId });

    if (!data || !data.success) {
      throw new Error('Failed to create shipment');
    }

    return data;
  } catch (error) {
    console.error('Error creating Topship shipment:', error);
    throw error;
  }
};

export const trackTopshipShipment = async (
  trackingId: string
): Promise<TopshipTrackingInfo> => {
  try {
    const data = await invokeFunction<any>('topship-track-shipment', { trackingId });

    if (!data) {
      throw new Error('No tracking information available');
    }

    return data;
  } catch (error) {
    console.error('Error tracking Topship shipment:', error);
    throw error;
  }
};
