import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider, useCart } from './contexts/CartContext';
import { ProductList } from './components/ProductList';
import { ProductPage } from './components/ProductPage';
import { Cart } from './components/Cart';
import { OrderForm } from './components/OrderForm';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { EmailVerification } from './components/EmailVerification';
import { ForgotPassword } from './components/ForgotPassword';
import { ResetPassword } from './components/ResetPassword';
import { Order } from './services/api';

type View = 'products' | 'productDetail' | 'cart' | 'orderForm' | 'login' | 'register' | 'forgotPassword' | 'resetPassword' | 'verifyEmail';
type AuthView = 'login' | 'register' | 'forgotPassword';

function AppContent() {
  const { user, loading, logout } = useAuth();
  const { cartItemCount, addToCart } = useCart();
  const [view, setView] = useState<View>('products');
  const [authView, setAuthView] = useState<AuthView>('login');
  const [showCart, setShowCart] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<Array<{ productId: string; quantity: number }>>([]);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);

  // Check URL for verification or reset tokens
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const pathname = window.location.pathname;
      
      // Try to get token from query parameter first
      let verifyToken = urlParams.get('token');
      
      // If not in query, try to extract from pathname
      if (!verifyToken) {
        const verifyMatch = pathname.match(/\/verify-email\/([^\/\?]+)/);
        if (verifyMatch) {
          verifyToken = verifyMatch[1];
        }
      }
      
      // Try to get reset token
      let resetTokenParam = urlParams.get('resetToken');
      if (!resetTokenParam) {
        const resetMatch = pathname.match(/\/reset-password\/([^\/\?]+)/);
        if (resetMatch) {
          resetTokenParam = resetMatch[1];
        }
      }
      
      if (verifyToken) {
        setVerificationToken(verifyToken);
        setView('verifyEmail');
      } else if (resetTokenParam) {
        setResetToken(resetTokenParam);
        setView('resetPassword');
      }
    } catch (error) {
      console.error('Error parsing URL for verification token:', error);
    }
  }, []);

  const handleAddToCart = async (productId: string) => {
    if (!user) {
      setView('login');
      setAuthView('login');
      return;
    }

    try {
      await addToCart(productId, 1);
      // Cart state will be automatically updated via CartContext
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleProductClick = (productId: string) => {
    setSelectedProductId(productId);
    setView('productDetail');
  };

  const handleBackToProducts = () => {
    setSelectedProductId(null);
    setView('products');
    setShowCart(false);
  };

  const handleCheckout = (items: Array<{ productId: string; quantity: number }>) => {
    setOrderItems(items);
    setView('orderForm');
    setShowCart(false);
  };

  const handleOrderCreated = (order: Order) => {
    setCreatedOrder(order);
    setView('products');
    setOrderItems([]);
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  // Show auth views if not authenticated
  if (!user && view !== 'verifyEmail' && view !== 'resetPassword') {
    return (
      <div>
        <header style={{
          backgroundColor: '#2563eb',
          color: 'white',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ margin: 0 }}>🛒 E-commerce Store</h1>
        </header>
        {authView === 'login' && (
          <Login
            onSwitchToRegister={() => setAuthView('register')}
            onSwitchToForgotPassword={() => setAuthView('forgotPassword')}
          />
        )}
        {authView === 'register' && (
          <Register onSwitchToLogin={() => setAuthView('login')} />
        )}
        {authView === 'forgotPassword' && (
          <ForgotPassword onSwitchToLogin={() => setAuthView('login')} />
        )}
      </div>
    );
  }

  // Show verification view
  if (view === 'verifyEmail') {
    return (
      <div>
        <header style={{
          backgroundColor: '#2563eb',
          color: 'white',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ margin: 0 }}>🛒 E-commerce Store</h1>
        </header>
        <EmailVerification token={verificationToken || undefined} />
      </div>
    );
  }

  // Show reset password view
  if (view === 'resetPassword' && resetToken) {
    return (
      <div>
        <header style={{
          backgroundColor: '#2563eb',
          color: 'white',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ margin: 0 }}>🛒 E-commerce Store</h1>
        </header>
        <ResetPassword
          token={resetToken}
          onSuccess={() => {
            setView('login');
            setAuthView('login');
            setResetToken(null);
          }}
        />
      </div>
    );
  }

  // Show order success
  if (createdOrder) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1 style={{ color: '#2563eb' }}>✅ Order created successfully!</h1>
        <div style={{ marginTop: '20px', padding: '20px', border: '2px solid #2563eb', borderRadius: '8px', display: 'inline-block' }}>
          <p><strong>Order ID:</strong> {createdOrder.id}</p>
          <p><strong>Total:</strong> ${createdOrder.total.toFixed(2)}</p>
          <p><strong>Status:</strong> {createdOrder.status}</p>
          <p><strong>Address:</strong> {createdOrder.shippingAddress}</p>
        </div>
        <button
          onClick={() => {
            setCreatedOrder(null);
            setShowCart(false);
            setView('products');
          }}
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

  // Show order form
  if (view === 'orderForm' && user) {
    return (
      <div>
        <header style={{
          backgroundColor: '#2563eb',
          color: 'white',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ margin: 0 }}>🛒 E-commerce Store</h1>
          <div>
            <span style={{ marginRight: '15px' }}>Welcome, {user.name}</span>
            <button
              onClick={logout}
              style={{
                padding: '6px 12px',
                backgroundColor: 'white',
                color: '#2563eb',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Logout
            </button>
          </div>
        </header>
        <OrderForm
          items={orderItems}
          onOrderCreated={handleOrderCreated}
          onCancel={() => {
            setView('cart');
            setShowCart(true);
          }}
        />
      </div>
    );
  }

  // Show product detail page
  if (view === 'productDetail' && selectedProductId) {
    return (
      <div>
        <header style={{
          backgroundColor: '#2563eb',
          color: 'white',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ margin: 0 }}>🛒 E-commerce Store</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {user && (
              <>
                <span>Welcome, {user.name}</span>
                <button
                  onClick={() => setShowCart(!showCart)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'white',
                    color: '#2563eb',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    position: 'relative'
                  }}
                >
                  {showCart ? 'View Products' : 'View Cart'}
                  {cartItemCount > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      {cartItemCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={logout}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: '1px solid white',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </header>
        <ProductPage
          productId={selectedProductId}
          onBack={handleBackToProducts}
          onAddToCart={handleAddToCart}
        />
      </div>
    );
  }

  // Main store view
  return (
    <div>
      <header style={{
        backgroundColor: '#2563eb',
        color: 'white',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0 }}>🛒 E-commerce Store</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {user && (
            <>
              <span>Welcome, {user.name}</span>
              <button
                onClick={() => setShowCart(!showCart)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'white',
                  color: '#2563eb',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  position: 'relative'
                }}
              >
                {showCart ? 'View Products' : 'View Cart'}
                {cartItemCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      backgroundColor: '#dc2626',
                      color: 'white',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  >
                    {cartItemCount}
                  </span>
                )}
              </button>
              <button
                onClick={logout}
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '1px solid white',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </header>
      {showCart && user ? (
        <Cart onCheckout={handleCheckout} />
      ) : (
        <ProductList 
          onAddToCart={handleAddToCart}
          onProductClick={handleProductClick}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
