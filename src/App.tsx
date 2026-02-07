import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { ProductPage } from './components/ProductPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { ForgotPassword } from './components/ForgotPassword';
import { EmailVerification } from './components/EmailVerification';
import { ResetPassword } from './components/ResetPassword';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={
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
                <Login />
              </div>
            } />
            <Route path="/register" element={
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
                <Register />
              </div>
            } />
            <Route path="/forgot-password" element={
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
                <ForgotPassword />
              </div>
            } />
            <Route path="/verify-email/:token" element={
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
                <EmailVerification />
              </div>
            } />
            <Route path="/reset-password/:token" element={
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
                <ResetPassword />
              </div>
            } />

            {/* Protected routes with layout */}
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/cart" element={
                <ProtectedRoute>
                  <CartPage />
                </ProtectedRoute>
              } />
              <Route path="/checkout" element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              } />
              <Route path="/order-success/:orderId" element={
                <ProtectedRoute>
                  <OrderSuccessPage />
                </ProtectedRoute>
              } />
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
