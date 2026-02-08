import { Link } from 'react-router-dom';
import type { Product } from '../services/api';

interface ProductCardProps {
  product: Product;
  quantityInCart: number;
  onAddToCart: (productId: string) => void;
  onProductClick?: (productId: string) => void;
}

export function ProductCard({ product, quantityInCart, onAddToCart }: ProductCardProps) {
  // Calculate available stock: total stock minus what's in cart
  const availableStock = product.stock - quantityInCart;
  const isOutOfStock = availableStock <= 0;

  return (
    <Link
      to={`/product/${product.id}`}
      style={{
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '16px',
          margin: '8px',
          maxWidth: '300px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        }}
      >
        {/* Product Image Preview */}
        {product.imageUrl && (
          <img
            src={product.imageUrl}
            alt={product.name}
            style={{
              width: '100%',
              height: '200px',
              objectFit: 'cover',
              borderRadius: '6px',
              marginBottom: '12px',
            }}
            onError={(e) => {
              // Hide image if it fails to load
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}

        <h3 style={{ marginTop: 0 }}>{product.name}</h3>
        <p style={{ color: '#666', fontSize: '14px' }}>{product.category}</p>
        <p
          style={{
            fontSize: '14px',
            color: '#4b5563',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {product.description}
        </p>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '16px',
          }}
        >
          <div>
            <strong style={{ fontSize: '20px', color: '#2563eb' }}>
              ${product.price.toFixed(2)}
            </strong>
            <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>
              Stock: {availableStock}
              {quantityInCart > 0 && (
                <span style={{ fontSize: '11px', color: '#999', marginLeft: '4px' }}>
                  ({quantityInCart} in cart)
                </span>
              )}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddToCart(product.id);
            }}
            disabled={isOutOfStock}
            style={{
              padding: '8px 16px',
              backgroundColor: isOutOfStock ? '#ccc' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isOutOfStock ? 'not-allowed' : 'pointer',
              fontSize: '14px',
            }}
          >
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  );
}
