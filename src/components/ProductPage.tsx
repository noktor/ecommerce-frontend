import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { api, type Product } from '../services/api';

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cart, addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadProduct = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await api.products.getById(id);
      setProduct(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) {
      return;
    }

    try {
      // Add items to cart (works for both authenticated and guest users)
      await addToCart(product.id, quantity);
      console.log(`Added ${quantity} item(s) to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Only show error if it's not a guest cart operation
      if (error instanceof Error && !error.message.includes('local cart')) {
        alert(`Error: ${error.message}`);
      }
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
          Back to Products
        </button>
      </div>
    );
  }

  // Calculate quantity in cart for this product
  const cartItem = cart?.items.find((item) => item.productId === product.id);
  const quantityInCart = cartItem?.quantity || 0;
  const availableStock = product.stock - quantityInCart;

  // Use longDescription if available, otherwise use description
  const displayDescription = product.longDescription || product.description;

  // Main product image: imageUrl (Cloudinary, etc.) or placeholder (placehold.co)
  const placeholderUrl = `https://placehold.co/600x400/f3f4f6/9ca3af?text=${encodeURIComponent(product.name)}`;
  const imageUrl = product.imageUrl || placeholderUrl;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <button
        onClick={() => navigate('/')}
        style={{
          marginBottom: '20px',
          padding: '8px 16px',
          backgroundColor: '#6b7280',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
        }}
      >
        ← Back to Products
      </button>

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        {/* Product image (main image for product page) */}
        <div style={{ flex: '1', minWidth: '300px' }}>
          <img
            src={imageUrl}
            alt={`${product.name} - product image`}
            style={{
              width: '100%',
              maxWidth: '600px',
              minHeight: '280px',
              height: 'auto',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              objectFit: 'cover',
              backgroundColor: '#f3f4f6',
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src !== placeholderUrl) {
                target.src = placeholderUrl;
              }
            }}
          />
        </div>

        {/* Product Details */}
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h1 style={{ marginTop: 0, fontSize: '32px', color: '#1f2937' }}>{product.name}</h1>

          <div style={{ marginBottom: '20px' }}>
            <span
              style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: '#2563eb',
              }}
            >
              ${product.price.toFixed(2)}
            </span>
          </div>

          <div
            style={{
              marginBottom: '20px',
              padding: '12px',
              backgroundColor: '#f3f4f6',
              borderRadius: '6px',
            }}
          >
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280' }}>
              Category: <strong>{product.category}</strong>
            </p>
            <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>
              Stock:{' '}
              <strong style={{ color: availableStock > 0 ? '#059669' : '#dc2626' }}>
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
          {availableStock > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
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
                    fontWeight: 'bold',
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
                    fontSize: '16px',
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
                    fontWeight: 'bold',
                  }}
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
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
              marginBottom: '20px',
            }}
          >
            {availableStock > 0 ? `Add ${quantity} to Cart` : 'Out of Stock'}
          </button>
          {!user && (
            <p
              style={{
                fontSize: '12px',
                color: '#6b7280',
                textAlign: 'center',
                marginTop: '-10px',
                marginBottom: '20px',
              }}
            >
              💡 Login to save your cart permanently
            </p>
          )}
        </div>
      </div>

      {/* Product Description */}
      <div
        style={{
          marginTop: '40px',
          padding: '24px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '24px', color: '#1f2937' }}>
          Product Description
        </h2>
        <p
          style={{
            fontSize: '16px',
            lineHeight: '1.6',
            color: '#4b5563',
            whiteSpace: 'pre-wrap',
          }}
        >
          {displayDescription}
        </p>
      </div>
    </div>
  );
}
