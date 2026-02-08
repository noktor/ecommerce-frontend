import { useCallback, useEffect, useRef, useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { api, type Product } from '../services/api';
import { ProductCard } from './ProductCard';

interface ProductListProps {
  onAddToCart: (productId: string) => void;
}

export function ProductList({ onAddToCart }: ProductListProps) {
  const { cart, cartItemCount } = useCart(); // Get cart to listen for changes
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string>('');
  const previousCartItemCountRef = useRef<number>(0);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.products.getAll(category || undefined);
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading products');
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Reload products periodically to sync with backend (every 30 seconds or when cart changes significantly)
  // Since we calculate available stock locally, we don't need to reload on every cart change
  useEffect(() => {
    const currentCount = cartItemCount;
    const previousCount = previousCartItemCountRef.current;

    // Only reload if the count changed significantly (more than 1 item difference)
    // This syncs with backend occasionally without being too aggressive
    if (Math.abs(currentCount - previousCount) > 1 && previousCount > 0) {
      loadProducts();
    }

    // Update the ref for next comparison
    previousCartItemCountRef.current = currentCount;
  }, [cartItemCount, loadProducts]);

  // Periodic sync with backend (every 30 seconds) to ensure stock accuracy
  useEffect(() => {
    const interval = setInterval(() => {
      if (cart && cart.items.length > 0) {
        loadProducts();
      }
    }, 30000); // Sync every 30 seconds

    return () => clearInterval(interval);
  }, [cart, loadProducts]);

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading products...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ marginTop: 0 }}>Products</h1>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '10px' }}>Filter by category:</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ padding: '8px', fontSize: '14px' }}
        >
          <option value="">All</option>
          <option value="Electronics">Electronics</option>
          <option value="Clothing">Clothing</option>
        </select>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {products.length === 0 ? (
          <p>No products available</p>
        ) : (
          products.map((product) => {
            // Calculate quantity in cart for this product
            const cartItem = cart?.items.find((item) => item.productId === product.id);
            const quantityInCart = cartItem?.quantity || 0;

            return (
              <ProductCard
                key={product.id}
                product={product}
                quantityInCart={quantityInCart}
                onAddToCart={onAddToCart}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
