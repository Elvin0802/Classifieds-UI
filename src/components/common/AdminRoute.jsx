import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Yalnızca admin kullanıcılar için erişim sağlayan route
function AdminRoute() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  
  // Yükleme durumunda bekletme yapabiliriz
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Yükleniyor...</div>;
  }
  
  // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
  if (!isAuthenticated) {
    return <Navigate to="/giris" replace />;
  }
  
  // Admin değilse anasayfaya yönlendir
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  // Admin ise alt route'ları göster
  return <Outlet />;
}

export default AdminRoute; 