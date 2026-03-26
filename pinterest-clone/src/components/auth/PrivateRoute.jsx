// src/components/auth/PrivateRoute.jsx
// Wraps protected routes. Shows a spinner while auth loads,
// redirects to /auth if not signed in.

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth';

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FAF7F2',
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            border: '2px solid #E8E2D9',
            borderTopColor: '#E63946',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
          }}
        >
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!user) {
    // Save the attempted URL so we can redirect back after login
    return <Navigate to='/auth' state={{ from: location }} replace />;
  }

  return children;
}
