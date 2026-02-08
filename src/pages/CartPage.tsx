import { useNavigate } from 'react-router-dom';
import { Cart } from '../components/Cart';

export function CartPage() {
  const navigate = useNavigate();

  const handleCheckout = (items: Array<{ productId: string; quantity: number }>) => {
    // Store items in sessionStorage temporarily for order form
    // Works for both authenticated and guest users
    sessionStorage.setItem('orderItems', JSON.stringify(items));
    navigate('/checkout');
  };

  return <Cart onCheckout={handleCheckout} />;
}
