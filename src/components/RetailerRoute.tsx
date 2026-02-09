import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface RetailerRouteProps {
  children: ReactNode;
}

export function RetailerRoute({ children }: RetailerRouteProps) {
  const { user, loading, isRetailer } = useAuth();

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user || !isRetailer) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

