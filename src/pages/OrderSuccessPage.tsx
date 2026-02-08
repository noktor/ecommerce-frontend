import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { api, type Order } from '../services/api';

export function OrderSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(location.state?.order as Order | null);
  const [loading, setLoading] = useState(!order);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If order is not in state, fetch it from API using orderId from URL
    if (!order && orderId) {
      const fetchOrder = async () => {
        try {
          setLoading(true);
          setError(null);
          const orderData = await api.orders.getById(orderId);
          setOrder(orderData);
        } catch (err) {
          console.error('Error fetching order:', err);
          setError(err instanceof Error ? err.message : 'Failed to load order');
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    } else if (!order && !orderId) {
      // No order in state and no orderId in URL - redirect to home
      navigate('/');
    }
  }, [orderId, navigate]); // Fetch when orderId changes, but not when order state changes

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: 'red' }}>Error: {error || 'Order not found'}</p>
        <button
          onClick={() => navigate('/')}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          Back to Store
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1 style={{ color: '#2563eb' }}>✅ Order created successfully!</h1>
      <div
        style={{
          marginTop: '20px',
          padding: '20px',
          border: '2px solid #2563eb',
          borderRadius: '8px',
          display: 'inline-block',
        }}
      >
        <p>
          <strong>Order ID:</strong> {order.id}
        </p>
        <p>
          <strong>Total:</strong> ${order.total.toFixed(2)}
        </p>
        <p>
          <strong>Status:</strong> {order.status}
        </p>
        <p>
          <strong>Address:</strong> {order.shippingAddress}
        </p>
      </div>
      <button
        onClick={() => navigate('/')}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        Back to Store
      </button>
    </div>
  );
}
