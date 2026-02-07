import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrderForm } from '../components/OrderForm';
import { Order } from '../services/api';

export function CheckoutPage() {
  const navigate = useNavigate();
  const [orderItems, setOrderItems] = useState<Array<{ productId: string; quantity: number }>>([]);

  useEffect(() => {
    const stored = sessionStorage.getItem('orderItems');
    if (stored) {
      setOrderItems(JSON.parse(stored));
    } else {
      navigate('/cart');
    }
  }, [navigate]);

  const handleOrderCreated = (order: Order) => {
    sessionStorage.removeItem('orderItems');
    navigate(`/order-success/${order.id}`, { state: { order } });
  };

  const handleCancel = () => {
    navigate('/cart');
  };

  return (
    <OrderForm
      items={orderItems}
      onOrderCreated={handleOrderCreated}
      onCancel={handleCancel}
    />
  );
}

