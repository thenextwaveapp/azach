export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  category: string;
  image_url: string;
  image_urls?: string[];
  sku?: string;
  stock: number;
  in_stock: boolean;
  featured: boolean;
  on_sale: boolean;
  gender?: 'men' | 'women' | 'unisex';
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface ProductInsert {
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  category: string;
  image_url: string;
  image_urls?: string[];
  sku?: string;
  stock: number;
  in_stock?: boolean;
  featured?: boolean;
  on_sale?: boolean;
  gender?: 'men' | 'women' | 'unisex';
  tags?: string[];
}

export interface ProductUpdate extends Partial<ProductInsert> {
  id: string;
}

// Helper type for frontend display (matching current ProductCard props)
export interface ProductDisplay {
  id: number | string;
  name: string;
  price: number;
  category: string;
  image: string;
  originalPrice?: number;
}









