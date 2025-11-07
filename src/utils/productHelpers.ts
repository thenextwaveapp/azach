import type { Product, ProductDisplay } from '@/types/product';

// Convert Supabase Product to ProductDisplay format for ProductCard
export const productToDisplay = (product: Product): ProductDisplay => ({
  id: product.id,
  name: product.name,
  price: product.price,
  category: product.category,
  image: product.image_url,
  originalPrice: product.original_price,
});

// Convert ProductDisplay to CartItem format
export const productToCartItem = (product: ProductDisplay) => ({
  id: product.id,
  name: product.name,
  price: product.price,
  image: product.image,
  category: product.category,
});

