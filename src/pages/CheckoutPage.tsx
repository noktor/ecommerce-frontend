import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrderForm } from '../components/OrderForm';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import type { Order } from '../services/api';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const [orderItems, setOrderItems] = useState<Array<{ productId: string; quantity: number }>>([]);

  useEffect(() => {
    // If user is authenticated, use cart from context
    if (user && cart && cart.items.length > 0) {
      setOrderItems(cart.items);
    } else {
      // Fallback to sessionStorage (for backwards compatibility)
      const stored = sessionStorage.getItem('orderItems');
      if (stored) {
        setOrderItems(JSON.parse(stored));
      } else {
        navigate('/cart');
      }
    }
  }, [navigate, cart, user]);

  const handleOrderCreated = async (order: Order) => {
    // Clear sessionStorage
    sessionStorage.removeItem('orderItems');
    
    // Clear cart (works for both authenticated and guest users)
    try {
      await clearCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
      // Don't block navigation if cart clearing fails
    }
    
    navigate(`/order-success/${order.id}`, { state: { order } });
  };

  const handleCancel = () => {
    navigate('/cart');
  };

  return (
    <OrderForm items={orderItems} onOrderCreated={handleOrderCreated} onCancel={handleCancel} />
  );
}
