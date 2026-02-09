import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export function Layout() {
  const { user, logout } = useAuth();
  const { cartItemCount } = useCart();

  return (
    <div>
      <header
        style={{
          backgroundColor: '#2563eb',
          color: 'white',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
          <h1 style={{ margin: 0 }}>🛒 E-commerce Store</h1>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {user ? (
            <>
              <span>
                Welcome, {user.name}
                {user.role === 'retailer' ? ' (Retailer)' : ''}
              </span>
              {user.role === 'retailer' && (
                <Link
                  to="/backoffice/stores"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'white',
                    color: '#2563eb',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                  }}
                >
                  Backoffice
                </Link>
              )}
              <Link
                to="/cart"
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'white',
                  color: '#2563eb',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  position: 'relative',
                }}
              >
                View Cart
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
                      fontWeight: 'bold',
                    }}
                  >
                    {cartItemCount}
                  </span>
                )}
              </Link>
              <button
                onClick={logout}
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '1px solid white',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/cart"
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'white',
                  color: '#2563eb',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  position: 'relative',
                }}
              >
                View Cart
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
                      fontWeight: 'bold',
                    }}
                  >
                    {cartItemCount}
                  </span>
                )}
              </Link>
              <Link
                to="/login"
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '1px solid white',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  textDecoration: 'none',
                }}
              >
                Login
              </Link>
            </>
          )}
        </div>
      </header>
      <Outlet />
    </div>
  );
}
