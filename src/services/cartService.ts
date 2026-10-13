import { supabase } from '@/lib/supabase';
import type { CurrencyPrices } from '@/types/product';

export interface CartItemDB {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  selected_size: string;
  created_at: string;
  updated_at: string;
}

export interface CartItemWithProduct {
  id: string;
  product_id: string;
  quantity: number;
  // Empty string = no size chosen (size-less product); kept as '' rather than NULL so
  // the (user_id, product_id, selected_size) unique constraint dedupes correctly.
  selected_size: string;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    category: string;
    stock: number;
    in_stock: boolean;
    currency_prices?: CurrencyPrices;
  };
}

class CartService {
  // Get user's cart from database
  async getCart(userId: string): Promise<CartItemWithProduct[]> {
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        product_id,
        quantity,
        selected_size,
        product:products (
          id,
          name,
          price,
          image_url,
          category,
          stock,
          in_stock,
          currency_prices
        )
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching cart:', error);
      return [];
    }

    return data || [];
  }

  // Add item to cart or update quantity if the same product+size already exists
  async addToCart(userId: string, productId: string, quantity: number = 1, size?: string): Promise<void> {
    const selectedSize = size || '';

    // Check if item already exists
    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .eq('selected_size', selectedSize)
      .maybeSingle();

    if (existing) {
      // Update quantity
      await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id);
    } else {
      // Insert new item
      await supabase
        .from('cart_items')
        .insert({
          user_id: userId,
          product_id: productId,
          quantity,
          selected_size: selectedSize,
        });
    }
  }

  // Update item quantity
  async updateQuantity(userId: string, productId: string, quantity: number, size?: string): Promise<void> {
    if (quantity <= 0) {
      await this.removeFromCart(userId, productId, size);
      return;
    }

    await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('user_id', userId)
      .eq('product_id', productId)
      .eq('selected_size', size || '');
  }

  // Remove item from cart
  async removeFromCart(userId: string, productId: string, size?: string): Promise<void> {
    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId)
      .eq('selected_size', size || '');
  }

  // Clear entire cart
  async clearCart(userId: string): Promise<void> {
    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);
  }

  // Sync local cart to database (merge)
  async syncLocalCart(userId: string, localItems: { id: string; quantity: number; size?: string }[]): Promise<void> {
    for (const item of localItems) {
      try {
        await this.addToCart(userId, item.id, item.quantity, item.size);
      } catch (error) {
        console.error('Error syncing cart item:', error);
      }
    }
  }
}

export const cartService = new CartService();
