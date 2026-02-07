import { useNavigate, useLocation } from 'react-router-dom';
import { Order } from '../services/api';

export function OrderSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const order = location.state?.order as Order | undefined;

  if (!order) {
    navigate('/');
    return null;
  }

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1 style={{ color: '#2563eb' }}>✅ Order created successfully!</h1>
      <div style={{ marginTop: '20px', padding: '20px', border: '2px solid #2563eb', borderRadius: '8px', display: 'inline-block' }}>
        <p><strong>Order ID:</strong> {order.id}</p>
        <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
        <p><strong>Status:</strong> {order.status}</p>
        <p><strong>Address:</strong> {order.shippingAddress}</p>
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
          fontSize: '16px'
        }}
      >
        Back to Store
      </button>
    </div>
  );
}

