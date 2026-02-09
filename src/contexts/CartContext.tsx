import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import { api, type CartItem, type Cart as CartType } from '../services/api';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: CartType | null;
  cartItemCount: number;
  loading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Local storage key for guest cart
const LOCAL_CART_KEY = 'guest_cart';

// Helper functions for local cart management
const getLocalCart = (): CartItem[] => {
  try {
    const stored = localStorage.getItem(LOCAL_CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveLocalCart = (items: CartItem[]): void => {
  try {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving local cart:', error);
  }
};

const clearLocalCart = (): void => {
  try {
    localStorage.removeItem(LOCAL_CART_KEY);
  } catch (error) {
    console.error('Error clearing local cart:', error);
  }
};

// Convert local cart items to Cart type
const createCartFromItems = (items: CartItem[]): CartType => {
  return {
    id: null,
    userId: 'guest',
    items,
    updatedAt: new Date().toISOString(),
  };
};

// Merge two carts (combine quantities for same products)
const mergeCarts = (localItems: CartItem[], serverItems: CartItem[]): CartItem[] => {
  const merged = new Map<string, number>();

  // Add server items first
  serverItems.forEach((item) => {
    merged.set(item.productId, item.quantity);
  });

  // Add local items (sum quantities if product exists)
  localItems.forEach((item) => {
    const existing = merged.get(item.productId) || 0;
    merged.set(item.productId, existing + item.quantity);
  });

  return Array.from(merged.entries()).map(([productId, quantity]) => ({
    productId,
    quantity,
  }));
};

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartType | null>(null);
  const [loading, setLoading] = useState(false);

  // Load server cart (authenticated users)
  const loadServerCart = async () => {
    if (!isAuthenticated || !user) {
      return null;
    }

    try {
      setLoading(true);
      const cartData = await api.cart.getByCustomerId();
      return cartData;
    } catch (error) {
      console.error('Error loading server cart:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Load local cart (guest users)
  const loadLocalCart = (): CartType | null => {
    const localItems = getLocalCart();
    if (localItems.length === 0) {
      return null;
    }
    return createCartFromItems(localItems);
  };

  // Load cart (server or local based on authentication)
  const loadCart = async () => {
    if (isAuthenticated && user) {
      // Load server cart
      const serverCart = await loadServerCart();
      if (serverCart) {
        // Merge with local cart if exists
        const localItems = getLocalCart();
        if (localItems.length > 0) {
          const mergedItems = mergeCarts(localItems, serverCart.items);
          // Save merged cart to server (we'll do this after login)
          setCart({ ...serverCart, items: mergedItems });
          // Clear local cart after merge
          clearLocalCart();
        } else {
          setCart(serverCart);
        }
      } else {
        setCart(null);
      }
    } else {
      // Load local cart for guests
      const localCart = loadLocalCart();
      setCart(localCart);
    }
  };

  // Load cart when authentication state changes
  useEffect(() => {
    loadCart();
  }, [isAuthenticated, user]);

  // When user logs in, merge local cart with server cart
  useEffect(() => {
    if (isAuthenticated && user) {
      const localItems = getLocalCart();
      if (localItems.length > 0) {
        // Add all local items to server cart
        // The server will handle merging quantities if items already exist
        Promise.all(
          localItems.map((item) =>
            api.cart.addItem(item.productId, item.quantity).catch((err) => {
              console.error(`Error merging cart item ${item.productId}:`, err);
            })
          )
        ).then(() => {
          // Clear local cart and reload server cart
          clearLocalCart();
          loadCart();
        });
      }
    }
  }, [isAuthenticated, user]);

  const refreshCart = async () => {
    await loadCart();
  };

  const addToCart = async (productId: string, quantity: number): Promise<void> => {
    if (isAuthenticated && user) {
      // Authenticated: add to server cart
      try {
        const updatedCart = await api.cart.addItem(productId, quantity);
        setCart(updatedCart);
      } catch (error) {
        console.error('Error adding to cart:', error);
        throw error;
      }
    } else {
      // Guest: add to local cart
      try {
        const localItems = getLocalCart();
        const existingItem = localItems.find((item) => item.productId === productId);

        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          localItems.push({ productId, quantity });
        }

        saveLocalCart(localItems);
        setCart(createCartFromItems(localItems));
      } catch (error) {
        console.error('Error adding to local cart:', error);
        throw error;
      }
    }
  };

  const removeFromCart = async (productId: string) => {
    if (isAuthenticated && user) {
      // Authenticated: remove from server cart
      try {
        await api.cart.removeItem(productId);
        await loadCart(); // Reload cart to get updated state
      } catch (error) {
        console.error('Error removing from cart:', error);
        throw error;
      }
    } else {
      // Guest: remove from local cart
      const localItems = getLocalCart().filter((item) => item.productId !== productId);
      saveLocalCart(localItems);

      if (localItems.length === 0) {
        setCart(null);
      } else {
        setCart(createCartFromItems(localItems));
      }
    }
  };

  const clearCart = async (): Promise<void> => {
    if (isAuthenticated && user) {
      // Authenticated: clear server cart
      try {
        // The server handles cart clearing after order creation
        // But we can also manually clear it here if needed
        await loadCart(); // Reload to get updated state
      } catch (error) {
        console.error('Error clearing cart:', error);
        throw error;
      }
    } else {
      // Guest: clear local cart
      clearLocalCart();
      setCart(null);
    }
  };

  // Calculate total item count
  const cartItemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItemCount,
        loading,
        refreshCart,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
