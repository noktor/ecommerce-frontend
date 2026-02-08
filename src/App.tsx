import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { EmailVerification } from './components/EmailVerification';
import { ForgotPassword } from './components/ForgotPassword';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { ProductPage } from './components/ProductPage';
import { Register } from './components/Register';
import { ResetPassword } from './components/ResetPassword';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { HomePage } from './pages/HomePage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Public routes */}
            <Route
              path="/login"
              element={
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
                    <h1 style={{ margin: 0 }}>🛒 E-commerce Store</h1>
                  </header>
                  <Login />
                </div>
              }
            />
            <Route
              path="/register"
              element={
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
                    <h1 style={{ margin: 0 }}>🛒 E-commerce Store</h1>
                  </header>
                  <Register />
                </div>
              }
            />
            <Route
              path="/forgot-password"
              element={
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
                    <h1 style={{ margin: 0 }}>🛒 E-commerce Store</h1>
                  </header>
                  <ForgotPassword />
                </div>
              }
            />
            <Route
              path="/verify-email/:token"
              element={
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
                    <h1 style={{ margin: 0 }}>🛒 E-commerce Store</h1>
                  </header>
                  <EmailVerification />
                </div>
              }
            />
            <Route
              path="/reset-password/:token"
              element={
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
                    <h1 style={{ margin: 0 }}>🛒 E-commerce Store</h1>
                  </header>
                  <ResetPassword />
                </div>
              }
            />

            {/* Routes with layout */}
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              {/* Cart is public - users can view their cart without login */}
              <Route path="/cart" element={<CartPage />} />
              {/* Checkout and order success are public - support guest orders */}
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
            </Route>

            {/* Redirect unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
