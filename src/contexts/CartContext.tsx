import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, Cart as CartType } from '../services/api';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: CartType | null;
  cartItemCount: number;
  loading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartType | null>(null);
  const [loading, setLoading] = useState(false);

  const loadCart = async () => {
    if (!isAuthenticated || !user) {
      setCart(null);
      return;
    }

    try {
      setLoading(true);
      const cartData = await api.cart.getByCustomerId();
      setCart(cartData);
    } catch (error) {
      console.error('Error loading cart:', error);
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  // Load cart when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      loadCart();
    } else {
      setCart(null);
    }
  }, [isAuthenticated, user]);

  const refreshCart = async () => {
    await loadCart();
  };

  const addToCart = async (productId: string, quantity: number) => {
    if (!isAuthenticated || !user) {
      throw new Error('User must be authenticated to add items to cart');
    }

    try {
      const updatedCart = await api.cart.addItem(productId, quantity);
      setCart(updatedCart);
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!isAuthenticated || !user) {
      throw new Error('User must be authenticated to remove items from cart');
    }

    try {
      await api.cart.removeItem(productId);
      await loadCart(); // Reload cart to get updated state
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
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

