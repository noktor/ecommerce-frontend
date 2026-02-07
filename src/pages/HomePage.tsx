import { ProductList } from '../components/ProductList';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

export function HomePage() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = async (productId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await addToCart(productId, 1);
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <ProductList
      onAddToCart={handleAddToCart}
    />
  );
}

