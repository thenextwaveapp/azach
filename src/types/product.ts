export interface ProductMeasurements {
  chest_in?: number;
  sleeve_in?: number;
  waist_in?: number;
  top_length_in?: number;
  bottom_length_in?: number;
}

export interface ProductModelInfo {
  height_in?: number;
  bust_in?: number;
  waist_in?: number;
  hips_in?: number;
  wearing_size?: string;
}

// Foreign currencies we offer manually-set prices in and can actually charge via Paystack
// (which supports NGN + USD for this account). NGN is always the base truth (the
// `price`/`original_price` columns).
export type ForeignCurrency = 'USD';

export interface CurrencyPriceEntry {
  price?: number;
  original_price?: number;
}

// One JSONB blob per product: { USD: { price, original_price } }
export type CurrencyPrices = Partial<Record<ForeignCurrency, CurrencyPriceEntry>>;

export interface ProductCurrencyPrices {
  currency_prices?: CurrencyPrices;
}

export interface Product extends ProductCurrencyPrices {
  id: string;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  category: string;
  image_url: string;
  image_urls?: string[];
  sku?: string;
  size?: string;
  material?: string;
  care_instructions?: string;
  style_code?: string;
  measurements?: ProductMeasurements;
  model_info?: ProductModelInfo;
  custom_size_available: boolean;
  // Set/bundle support: a bundle's stock is computed from its components, never entered manually
  is_bundle: boolean;
  bundle_id?: string;
  bundle_quantity: number;
  bundle_role?: string;
  stock: number;
  in_stock: boolean;
  featured: boolean;
  on_sale: boolean;
  gender?: ('men' | 'women' | 'unisex')[];
  tags?: string[];
  // Shipping fields for DHL Express integration
  weight_kg?: number;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
  hs_code?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductInsert extends ProductCurrencyPrices {
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  category: string;
  image_url: string;
  image_urls?: string[];
  sku?: string;
  size?: string;
  material?: string;
  care_instructions?: string;
  style_code?: string;
  measurements?: ProductMeasurements;
  model_info?: ProductModelInfo;
  custom_size_available?: boolean;
  is_bundle?: boolean;
  bundle_id?: string;
  bundle_quantity?: number;
  bundle_role?: string;
  stock: number;
  in_stock?: boolean;
  featured?: boolean;
  on_sale?: boolean;
  gender?: ('men' | 'women' | 'unisex')[];
  tags?: string[];
  // Shipping fields for DHL Express integration
  weight_kg?: number;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
  hs_code?: string;
}

export interface ProductUpdate extends Partial<ProductInsert> {
  id: string;
}

// Helper type for frontend display (matching current ProductCard props)
export interface ProductDisplay extends ProductCurrencyPrices {
  id: number | string;
  name: string;
  price: number;
  category: string;
  image: string;
  originalPrice?: number;
}









