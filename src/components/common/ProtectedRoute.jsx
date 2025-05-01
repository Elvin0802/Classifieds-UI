import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

// Yalnızca giriş yapmış kullanıcılar için erişim sağlayan route
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <span className="sr-only">Yükleniyor...</span>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    // Redirect to login page with return path
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  return children;
};

export default ProtectedRoute; 