import { ProductList } from '../components/ProductList';
import { useCart } from '../contexts/CartContext';

export function HomePage() {
  const { addToCart } = useCart();

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId, 1);
      // Item added successfully (works for both authenticated and guest users)
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Only show error if it's not a guest cart operation
      if (error instanceof Error && !error.message.includes('local cart')) {
        alert(`Error: ${error.message}`);
      }
    }
  };

  return (
    <ProductList
      onAddToCart={handleAddToCart}
    />
  );
}

