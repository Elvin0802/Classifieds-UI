import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Yalnızca giriş yapmış kullanıcılar için erişim sağlayan route
function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Yükleme durumunda bekletme yapabiliriz
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Yükleniyor...</div>;
  }
  
  // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
  if (!isAuthenticated) {
    return <Navigate to="/giris" replace />;
  }
  
  // Giriş yapmışsa alt route'ları göster
  return <Outlet />;
}

export default ProtectedRoute; 