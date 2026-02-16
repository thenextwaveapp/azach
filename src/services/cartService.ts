import { supabase } from '@/lib/supabase';

export interface CartItemDB {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface CartItemWithProduct {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    category: string;
    stock: number;
    in_stock: boolean;
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
        product:products (
          id,
          name,
          price,
          image_url,
          category,
          stock,
          in_stock
        )
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching cart:', error);
      return [];
    }

    return data || [];
  }

  // Add item to cart or update quantity if exists
  async addToCart(userId: string, productId: string, quantity: number = 1): Promise<void> {
    // Check if item already exists
    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('product_id', productId)
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
        });
    }
  }

  // Update item quantity
  async updateQuantity(userId: string, productId: string, quantity: number): Promise<void> {
    if (quantity <= 0) {
      await this.removeFromCart(userId, productId);
      return;
    }

    await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('user_id', userId)
      .eq('product_id', productId);
  }

  // Remove item from cart
  async removeFromCart(userId: string, productId: string): Promise<void> {
    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);
  }

  // Clear entire cart
  async clearCart(userId: string): Promise<void> {
    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);
  }

  // Sync local cart to database (merge)
  async syncLocalCart(userId: string, localItems: { id: string; quantity: number }[]): Promise<void> {
    for (const item of localItems) {
      try {
        await this.addToCart(userId, item.id, item.quantity);
      } catch (error) {
        console.error('Error syncing cart item:', error);
      }
    }
  }
}

export const cartService = new CartService();
