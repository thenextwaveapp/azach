import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { useCurrency } from "./CurrencyContext";
import { cartService } from "@/services/cartService";
import { trackRemoveFromCart } from "@/lib/analytics";
import type { CurrencyPrices } from "@/types/product";

export interface CartItem {
  id: number | string;
  name: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
  size?: string;
  currency_prices?: CurrencyPrices;
}

// A cart line is identified by product + chosen size, so the same product in two
// sizes shows as two lines.
const isSameLine = (item: CartItem, id: number | string, size?: string) =>
  item.id === id && (item.size || '') === (size || '');

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: number | string, size?: string) => void;
  updateQuantity: (id: number | string, quantity: number, size?: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'azach-cart';

// Load cart from localStorage
const loadCartFromStorage = (): CartItem[] => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading cart from storage:', error);
    return [];
  }
};

// Save cart to localStorage
const saveCartToStorage = (items: CartItem[]) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving cart to storage:', error);
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { currency, getPrice } = useCurrency();
  const [items, setItems] = useState<CartItem[]>(loadCartFromStorage);
  const [synced, setSynced] = useState(false);

  // Load cart from database when user logs in
  useEffect(() => {
    const loadUserCart = async () => {
      if (user && !synced) {
        try {
          // Get local cart
          const localCart = loadCartFromStorage();

          // Sync local cart to database if it has items
          if (localCart.length > 0) {
            const localCartForSync = localCart.map(item => ({
              id: String(item.id),
              quantity: item.quantity,
              size: item.size,
            }));
            await cartService.syncLocalCart(user.id, localCartForSync);

            // Clear local storage after sync
            localStorage.removeItem(CART_STORAGE_KEY);
          }

          // Load cart from database
          const dbCart = await cartService.getCart(user.id);
          const cartItems: CartItem[] = dbCart.map(item => ({
            id: item.product_id,
            name: item.product.name,
            price: item.product.price,
            image: item.product.image_url,
            category: item.product.category,
            quantity: item.quantity,
            size: item.selected_size || undefined,
            currency_prices: item.product.currency_prices,
          }));

          setItems(cartItems);
          setSynced(true);
        } catch (error) {
          console.error('Error loading user cart:', error);
        }
      } else if (!user) {
        // User logged out, reset sync flag
        setSynced(false);
      }
    };

    loadUserCart();
  }, [user, synced]);

  // Save to localStorage for guest users
  useEffect(() => {
    if (!user) {
      saveCartToStorage(items);
    }
  }, [items, user]);

  const addToCart = async (item: Omit<CartItem, "quantity">) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => isSameLine(i, item.id, item.size));
      if (existingItem) {
        return prevItems.map((i) =>
          isSameLine(i, item.id, item.size) ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevItems, { ...item, quantity: 1 }];
    });

    // Sync to database if user is logged in
    if (user) {
      try {
        await cartService.addToCart(user.id, String(item.id), 1, item.size);
      } catch (error) {
        console.error('Error adding to cart:', error);
      }
    }
  };

  const removeFromCart = async (id: number | string, size?: string) => {
    const removed = items.find((item) => isSameLine(item, id, size));
    if (removed) {
      const display = getPrice(removed);
      trackRemoveFromCart(
        {
          item_id: String(removed.id),
          item_name: removed.name,
          price: display?.amount ?? removed.price,
          quantity: removed.quantity,
          item_category: removed.category,
        },
        currency
      );
    }

    setItems((prevItems) => prevItems.filter((item) => !isSameLine(item, id, size)));

    // Sync to database if user is logged in
    if (user) {
      try {
        await cartService.removeFromCart(user.id, String(id), size);
      } catch (error) {
        console.error('Error removing from cart:', error);
      }
    }
  };

  const updateQuantity = async (id: number | string, quantity: number, size?: string) => {
    if (quantity <= 0) {
      removeFromCart(id, size);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        isSameLine(item, id, size) ? { ...item, quantity } : item
      )
    );

    // Sync to database if user is logged in
    if (user) {
      try {
        await cartService.updateQuantity(user.id, String(id), quantity, size);
      } catch (error) {
        console.error('Error updating quantity:', error);
      }
    }
  };

  const clearCart = async () => {
    setItems([]);

    // Sync to database if user is logged in
    if (user) {
      try {
        await cartService.clearCart(user.id);
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    }
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

