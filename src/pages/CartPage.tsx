import { Cart } from '../components/Cart';
import { useNavigate } from 'react-router-dom';

export function CartPage() {
  const navigate = useNavigate();

  const handleCheckout = (items: Array<{ productId: string; quantity: number }>) => {
    // Store items in sessionStorage temporarily for order form
    sessionStorage.setItem('orderItems', JSON.stringify(items));
    navigate('/checkout');
  };

  return <Cart onCheckout={handleCheckout} />;
}

