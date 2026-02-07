import { useState, useEffect } from 'react';
import { api, Product } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

interface ProductPageProps {
  productId: string;
  onBack: () => void;
  onAddToCart: (productId: string) => void;
}

export function ProductPage({ productId, onBack, onAddToCart }: ProductPageProps) {
  
  const { cart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const loadProduct = async () => {
    if (!productId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await api.products.getById(productId);
      setProduct(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product || !user) {
      alert('Please log in to add items to cart');
      return;
    }

    try {
      for (let i = 0; i < quantity; i++) {
        await onAddToCart(product.id);
      }
      console.log(`Added ${quantity} item(s) to cart!`);
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: 'red' }}>Error: {error || 'Product not found'}</p>
        <button
          onClick={onBack}
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
          Back to Products
        </button>
      </div>
    );
  }

  // Calculate quantity in cart for this product
  const cartItem = cart?.items.find(item => item.productId === product.id);
  const quantityInCart = cartItem?.quantity || 0;
  const availableStock = product.stock - quantityInCart;

  // Use longDescription if available, otherwise use description
  const displayDescription = product.longDescription || product.description;

  // Use imageUrl if available, otherwise use a placeholder
  const imageUrl = product.imageUrl || `https://via.placeholder.com/600x400?text=${encodeURIComponent(product.name)}`;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <button
        onClick={onBack}
        style={{
          marginBottom: '20px',
          padding: '8px 16px',
          backgroundColor: '#6b7280',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        ← Back to Products
      </button>

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        {/* Product Image */}
        <div style={{ flex: '1', minWidth: '300px' }}>
          <img
            src={imageUrl}
            alt={product.name}
            style={{
              width: '100%',
              maxWidth: '600px',
              height: 'auto',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              objectFit: 'cover'
            }}
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              const target = e.target as HTMLImageElement;
              target.src = `https://via.placeholder.com/600x400?text=${encodeURIComponent(product.name)}`;
            }}
          />
        </div>

        {/* Product Details */}
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h1 style={{ marginTop: 0, fontSize: '32px', color: '#1f2937' }}>
            {product.name}
          </h1>
          
          <div style={{ marginBottom: '20px' }}>
            <span style={{ 
              fontSize: '36px', 
              fontWeight: 'bold', 
              color: '#2563eb' 
            }}>
              ${product.price.toFixed(2)}
            </span>
          </div>

          <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280' }}>
              Category: <strong>{product.category}</strong>
            </p>
            <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>
              Stock: <strong style={{ color: availableStock > 0 ? '#059669' : '#dc2626' }}>
                {availableStock} available
              </strong>
              {quantityInCart > 0 && (
                <span style={{ marginLeft: '8px', fontSize: '12px', color: '#9ca3af' }}>
                  ({quantityInCart} in cart)
                </span>
              )}
            </p>
          </div>

          {/* Quantity Selector */}
          {availableStock > 0 && user && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Quantity:
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: quantity <= 1 ? '#e5e7eb' : '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  max={availableStock}
                  value={quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    setQuantity(Math.max(1, Math.min(availableStock, value)));
                  }}
                  style={{
                    width: '80px',
                    padding: '8px',
                    textAlign: 'center',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                />
                <button
                  onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                  disabled={quantity >= availableStock}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: quantity >= availableStock ? '#e5e7eb' : '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: quantity >= availableStock ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          {user ? (
            <button
              onClick={handleAddToCart}
              disabled={availableStock <= 0}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: availableStock > 0 ? '#2563eb' : '#9ca3af',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: availableStock > 0 ? 'pointer' : 'not-allowed',
                marginBottom: '20px'
              }}
            >
              {availableStock > 0 ? `Add ${quantity} to Cart` : 'Out of Stock'}
            </button>
          ) : (
            <button
              onClick={() => alert('Please log in to add items to cart')}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginBottom: '20px'
              }}
            >
              Log in to Add to Cart
            </button>
          )}
        </div>
      </div>

      {/* Product Description */}
      <div style={{ marginTop: '40px', padding: '24px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
        <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '24px', color: '#1f2937' }}>
          Product Description
        </h2>
        <p style={{ 
          fontSize: '16px', 
          lineHeight: '1.6', 
          color: '#4b5563',
          whiteSpace: 'pre-wrap'
        }}>
          {displayDescription}
        </p>
      </div>
    </div>
  );
}

