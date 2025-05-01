import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { Loader2, ShieldAlert } from 'lucide-react';

// Yalnızca admin kullanıcılar için erişim sağlayan route
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useContext(AuthContext);
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <span className="sr-only">Yüklənir...</span>
      </div>
    );
  }
  
  // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  // Kullanıcı admin değilse ana sayfaya yönlendir
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
        <ShieldAlert className="h-16 w-16 text-red-500 mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">İcazəsiz Giriş</h1>
        <p className="text-gray-600 mb-4 text-center">Bu səhifəyə baxmaq üçün admin hüquqlarınız olmalıdır.</p>
        <Navigate to="/" replace />
      </div>
    );
  }
  
  return children;
};

export default AdminRoute; 