import { useState, useEffect } from 'react';
import { api, Product } from '../services/api';
import { useCart } from '../contexts/CartContext';

interface CartProps {
  onCheckout: (items: Array<{ productId: string; quantity: number }>) => void;
}

export function Cart({ onCheckout }: CartProps) {
  const { cart, removeFromCart } = useCart();
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    loadProductDetails();
  }, [cart]);

  // Calculate and update time remaining for cart expiration
  useEffect(() => {
    if (!cart?.expiresAt) {
      setTimeRemaining(null);
      return;
    }

    const updateTimeRemaining = () => {
      const now = new Date().getTime();
      const expiresAt = new Date(cart.expiresAt!).getTime();
      const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000)); // seconds
      setTimeRemaining(remaining);
    };

    // Update immediately
    updateTimeRemaining();

    // Update every second
    const interval = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [cart?.expiresAt]);

  const loadProductDetails = async () => {
    if (!cart || cart.items.length === 0) {
      setProducts({});
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Load product details for cart items
      const productPromises = cart.items.map(item =>
        api.products.getById(item.productId)
      );
      const productData = await Promise.all(productPromises);
      const productMap: Record<string, Product> = {};
      productData.forEach(product => {
        productMap[product.id] = product;
      });
      setProducts(productMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading products');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = () => {
    if (cart && cart.items.length > 0) {
      // Store items in sessionStorage for checkout (backwards compatibility)
      sessionStorage.setItem('orderItems', JSON.stringify(cart.items));
      onCheckout(cart.items);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeFromCart(productId);
      // Cart state will be automatically updated via CartContext
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading cart...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Cart</h2>
        <p>Your cart is empty</p>
      </div>
    );
  }

  const total = cart.items.reduce((sum, item) => {
    const product = products[item.productId];
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  // Format time remaining
  const formatTimeRemaining = (seconds: number): string => {
    if (seconds <= 0) return 'Expired';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const isExpiringSoon = timeRemaining !== null && timeRemaining < 300; // Less than 5 minutes
  
  // Only show timer for e-commerce with time-sensitive items (tickets, limited stock, etc.)
  // For regular e-commerce, only show warning when expiring soon
  const SHOW_CART_TIMER = import.meta.env.VITE_SHOW_CART_TIMER === 'true'; // Configurable via env var
  const shouldShowTimer = SHOW_CART_TIMER || isExpiringSoon;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Cart</h2>
        {shouldShowTimer && timeRemaining !== null && (
          <div
            style={{
              padding: '8px 16px',
              backgroundColor: isExpiringSoon ? '#fef3c7' : '#dbeafe',
              color: isExpiringSoon ? '#92400e' : '#1e40af',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 'bold',
              border: `1px solid ${isExpiringSoon ? '#fbbf24' : '#3b82f6'}`,
            }}
          >
            {isExpiringSoon && '⚠️ '}
            {SHOW_CART_TIMER 
              ? `Items reserved for: ${formatTimeRemaining(timeRemaining)}`
              : `Cart expires in: ${formatTimeRemaining(timeRemaining)}`
            }
            {isExpiringSoon && ' - Complete checkout soon!'}
          </div>
        )}
      </div>
      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px' }}>
        {cart.items.map((item) => {
          const product = products[item.productId];
          if (!product) return null;

          return (
            <div
              key={item.productId}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                borderBottom: '1px solid #eee'
              }}
            >
              <div style={{ flex: 1 }}>
                <strong>{product.name}</strong>
                <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                  Quantity: {item.quantity} × ${product.price.toFixed(2)}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  ${(product.price * item.quantity).toFixed(2)}
                </div>
                <button
                  onClick={() => handleRemoveItem(item.productId)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                  title="Remove from cart"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
        <div
          style={{
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '2px solid #2563eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <strong style={{ fontSize: '20px' }}>Total:</strong>
          <strong style={{ fontSize: '24px', color: '#2563eb' }}>${total.toFixed(2)}</strong>
        </div>
        <button
          onClick={handleCheckout}
          style={{
            marginTop: '16px',
            width: '100%',
            padding: '12px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Checkout
        </button>
      </div>
    </div>
  );
}

