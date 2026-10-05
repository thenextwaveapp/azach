import type { Product, ProductDisplay } from '@/types/product';

type GetPriceFn = (
  product: { price: number; original_price?: number; currency_prices?: Product['currency_prices'] },
  tier?: 'price' | 'original_price'
) => { amount: number; currency: string } | null;

// The amount actually shown on a product's card in the visitor's current currency — for
// non-NGN currencies this is a manually-set price anchor, not a live conversion of the NGN
// price, so anything comparing against "the product's price" (e.g. the price filter) needs
// to use this rather than `product.price` directly to stay consistent with what's on screen.
export const getDisplayPriceAmount = (product: Product, getPrice: GetPriceFn): number =>
  getPrice(product)?.amount ?? product.price;

// Convert Supabase Product to ProductDisplay format for ProductCard
export const productToDisplay = (product: Product): ProductDisplay => ({
  id: product.id,
  name: product.name,
  price: product.price,
  category: product.category,
  image: product.image_url,
  originalPrice: product.original_price,
  currency_prices: product.currency_prices,
});

// Convert ProductDisplay to CartItem format
export const productToCartItem = (product: ProductDisplay) => ({
  id: product.id,
  name: product.name,
  price: product.price,
  image: product.image,
  category: product.category,
});

