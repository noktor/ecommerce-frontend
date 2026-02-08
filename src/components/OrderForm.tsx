import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api, type Order } from '../services/api';

export interface OrderFormProps {
  items: Array<{ productId: string; quantity: number }>;
  onOrderCreated: (order: Order) => void;
  onCancel: () => void;
}

export function OrderForm({ items, onOrderCreated, onCancel }: OrderFormProps) {
  const { user } = useAuth();
  const [shippingAddress, setShippingAddress] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestName, setGuestName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shippingAddress.trim()) {
      setError('Shipping address is required');
      return;
    }

    // For guest users, require email and name
    if (!user) {
      if (!guestEmail.trim() || !guestName.trim()) {
        setError('Email and name are required for guest orders');
        return;
      }
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(guestEmail)) {
        setError('Please enter a valid email address');
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);
      const order = await api.orders.create(
        items,
        shippingAddress,
        user ? undefined : guestEmail, // Only send guestEmail if not authenticated
        user ? undefined : guestName // Only send guestName if not authenticated
      );
      onOrderCreated(order);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px' }}>
      <h2>Complete Order</h2>
      {!user && (
        <div
          style={{
            marginBottom: '20px',
            padding: '12px',
            backgroundColor: '#fef3c7',
            borderRadius: '6px',
            border: '1px solid #fbbf24',
          }}
        >
          <p style={{ margin: 0, fontSize: '14px', color: '#92400e' }}>
            You're checking out as a guest. Please provide your contact information.
          </p>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        {!user && (
          <>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Email: <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="your.email@example.com"
                style={{
                  width: '100%',
                  padding: '8px',
                  fontSize: '14px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontFamily: 'inherit',
                }}
                required
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Full Name: <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="John Doe"
                style={{
                  width: '100%',
                  padding: '8px',
                  fontSize: '14px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontFamily: 'inherit',
                }}
                required
              />
            </div>
          </>
        )}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Shipping Address: <span style={{ color: 'red' }}>*</span>
          </label>
          <textarea
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            placeholder="Enter shipping address"
            rows={4}
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '14px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontFamily: 'inherit',
            }}
            required
          />
        </div>
        {error && (
          <div style={{ color: 'red', marginBottom: '16px', fontSize: '14px' }}>{error}</div>
        )}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: loading ? '#ccc' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            {loading ? 'Creating order...' : 'Create Order'}
          </button>
        </div>
      </form>
    </div>
  );
}

// Default export for compatibility
export default OrderForm;
