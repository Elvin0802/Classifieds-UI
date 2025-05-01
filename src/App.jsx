import React, { useEffect, useContext, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { AuthProvider, AuthContext } from './contexts/AuthContext';

// Layout
import Layout from './components/layout/Layout';

// Auth ve API
import { getAccessToken } from './services/axiosConfig';

// Pages
import Home from './pages/home/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import AdsList from './pages/ads/AdsList';
import AdDetail from './pages/ads/AdDetail';
import CreateAd from './pages/ads/CreateAd';
import EditAd from './pages/ads/EditAd';
import Profile from './pages/profile/Profile';
import SelectedAds from './pages/ads/SelectedAds';
import NotFound from './pages/NotFound';

// Messages Pages
import MessagesList from './pages/messages/MessagesList';
import MessageDetail from './pages/messages/MessageDetail';

// Info Pages
import AboutPage from './pages/info/AboutPage';
import PrivacyPage from './pages/info/PrivacyPage';
import HelpPage from './pages/info/HelpPage';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCategories from './pages/admin/categories/AdminCategories';
import CreateMainCategory from './pages/admin/categories/CreateMainCategory';
import CreateSubCategory from './pages/admin/categories/CreateSubCategory';
import CreateCategory from './pages/admin/categories/CreateCategory';
import AdminLocations from './pages/admin/locations/AdminLocations';
import CreateLocation from './pages/admin/locations/CreateLocation';
import AdminPendingAds from './pages/admin/ads/AdminPendingAds';
import ReportsList from './pages/admin/reports/ReportsList';
import ReportDetail from './pages/admin/reports/ReportDetail';

// Services
import authService from './services/authService';
import chatService from './services/chatService';

// Private Route Component
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  
  // Auth yükleniyorsa, kullanıcıyı bekletelim
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    toast.error('Bu səhifəyə baxmaq üçün daxil olmalısınız.');
    return <Navigate to="/login" state={{ from: window.location.pathname }} />;
  }
  
  return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useContext(AuthContext);
  
  // Eğer yükleme devam ediyorsa bekle
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Token ve admin kontrolü
  const token = getAccessToken();
  const hasAdminAccess = isAdmin;
  
  if (token && hasAdminAccess) {
    console.log('AdminRoute - Erişim izni verildi');
    return children;
  }
  
  // Kimlik doğrulaması yapılmamışsa login sayfasına yönlendir
  if (!isAuthenticated && !token) {
    console.log('AdminRoute - Kimlik doğrulama başarısız');
    toast.error('Bu səhifəyə baxmaq üçün daxil olmalısınız.');
    return <Navigate to="/login" state={{ from: window.location.pathname }} />;
  }
  
  // Kullanıcı giriş yapmış ama admin değilse ana sayfaya yönlendir
  console.log('AdminRoute - Admin yetkisi yok');
  toast.error('Bu səhifəyə baxmağa icazəniz yoxdur.');
  return <Navigate to="/" />;
};

// SignalR bağlantısı başlatıldı mı flag'i
let signalRInitialized = false;

function AppContent() {
  const { handleForceLogout, isAuthenticated } = useContext(AuthContext);
  // SignalR bağlantı durumunu takip et
  const [signalRConnected, setSignalRConnected] = useState(false);
  
  // Global bir axios hata yakalayıcı ekle
  useEffect(() => {
    // Axios hatalarını global olarak izle
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        // Token yenileme hatası özel bir işaret ile geliyorsa
        if (error && error.isTokenRefreshFailed) {
          console.log('App.jsx: Token yenileme hatası yakalandı, kullanıcı aktif bir işlem yapmaya çalıştı, çıkış yapılıyor');
          // Kullanıcı aktif bir işlem yapmaya çalıştığında oturumu sonlandır
          handleForceLogout();
          
          // Kullanıcıya özel hata mesajı göster
          if (error.message) {
            toast.error(error.message);
          }
        }
        
        return Promise.reject(error);
      }
    );
    
    // Cleanup
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [handleForceLogout]);
  
  // SignalR bağlantı durumunu izle
  useEffect(() => {
    // Bağlantı durumu değişikliğini izlemek için observer ekle
    const unsubscribe = chatService.addConnectionObserver((connected) => {
      console.log('App.jsx: SignalR bağlantı durumu değişti:', connected ? 'bağlı' : 'bağlı değil');
      setSignalRConnected(connected);
    });
    
    return () => {
      // Observer'ı temizle
      if (unsubscribe) unsubscribe();
    };
  }, []);
  
  // SignalR bağlantısını yönet
  useEffect(() => {
    if (isAuthenticated && !signalRInitialized && chatService.isSignalREnabled()) {
      console.log('App.jsx: SignalR bağlantısı başlatılıyor...');
      
      // İlk başlatma işlemini flag ile işaretle
      signalRInitialized = true;
      
      // Bağlantıyı başlat
      const connectSignalR = async () => {
        try {
          await chatService.startConnection();
          console.log('App.jsx: SignalR bağlantısı başarıyla başlatıldı');
        } catch (err) {
          console.error('App.jsx: SignalR bağlantısı başlatılırken hata:', err);
          // Bağlantı başarısız olsa bile uygulamayı durdurmuyoruz
        }
      };
      
      // Sayfa yüklendikten 1 saniye sonra bağlanma isteği gönder
      // Bu, sayfa yüklenirken diğer önemli kaynakların önceliklendirilmesini sağlar
      setTimeout(connectSignalR, 1000);
    }
    
    // Kullanıcı çıkış yaptığında bağlantıyı kapat
    if (!isAuthenticated && signalRInitialized) {
      console.log('App.jsx: Kullanıcı çıkış yaptı, SignalR bağlantısı kapatılıyor...');
      chatService.stopConnection();
      signalRInitialized = false;
    }
    
    // Bileşen unmount olduğunda
    return () => {
      // Uygulama kapatılırken bağlantıyı kapat
      if (signalRInitialized) {
        console.log('App.jsx: Uygulama kapatılıyor, SignalR bağlantısı kapatılıyor...');
        chatService.stopConnection();
      }
    };
  }, [isAuthenticated]);
  
  // Sayfa görünürlüğünü izle
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Sayfa görünür olduğunda ve kullanıcı giriş yapmışsa
      if (document.visibilityState === 'visible' && isAuthenticated && signalRInitialized) {
        console.log('App.jsx: Sayfa görünür oldu, SignalR bağlantısı kontrol ediliyor...');
        
        // Eğer SignalR devre dışı bırakılmadıysa ve bağlantı yok ise, bağlantıyı yeniden başlat
        if (chatService.isSignalREnabled() && !signalRConnected) {
          chatService.ensureConnection().catch(err => {
            console.warn('App.jsx: Görünürlük değişimi sırasında bağlantı hatası:', err);
          });
        }
      }
    };
    
    // Sayfa görünürlük değişikliğini dinle
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, signalRConnected]);
  
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Public Routes */}
          <Route index element={<Home />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/giris" element={<Navigate to="/login" replace />} />
          
          <Route path="/register" element={<Register />} />
          <Route path="/kayit" element={<Navigate to="/register" replace />} />
          
          {/* Password Reset Routes */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/sifremi-unuttum" element={<Navigate to="/forgot-password" replace />} />
          
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/sifre-sifirlama" element={<Navigate to="/reset-password" replace />} />
          <Route path="/update-password/:userId/:token" element={<ResetPassword />} />
          
          {/* Ads Routes */}
          <Route path="/ads" element={<AdsList />} />
          <Route path="/ilanlar" element={<Navigate to="/ads" replace />} />
          
          <Route path="/ads/:id" element={<AdDetail />} />
          <Route path="/ilanlar/:id" element={<Navigate to={`/ads/${window.location.pathname.split('/').pop()}`} replace />} />
          
          <Route path="/favorites" element={<SelectedAds />} />
          <Route path="/ilanlar/favori" element={<Navigate to="/favorites" replace />} />
          <Route path="/ads/selected" element={<Navigate to="/favorites" replace />} />
          
          {/* Messages Routes */}
          <Route path="/messages" element={
            <PrivateRoute>
              <MessagesList />
            </PrivateRoute>
          } />
          <Route path="/mesajlar" element={<Navigate to="/messages" replace />} />
          
          <Route path="/messages/:chatRoomId" element={
            <PrivateRoute>
              <MessageDetail />
            </PrivateRoute>
          } />
          <Route path="/mesajlar/:chatRoomId" element={
            <Navigate to={`/messages/${window.location.pathname.split('/').pop()}`} replace />
          } />
          
          {/* Info Pages */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/hakkimizda" element={<Navigate to="/about" replace />} />
          
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/gizlilik" element={<Navigate to="/privacy" replace />} />
          
          <Route path="/help" element={<HelpPage />} />
          <Route path="/yardim" element={<Navigate to="/help" replace />} />
          
          {/* Protected Routes */}
          <Route path="/ads/create" element={
            <PrivateRoute>
              <CreateAd />
            </PrivateRoute>
          } />
          <Route path="/ilanlar/yeni" element={
            <Navigate to="/ads/create" replace />
          } />
          
          <Route path="/ads/edit/:id" element={
            <PrivateRoute>
              <EditAd />
            </PrivateRoute>
          } />
          <Route path="/ilanlar/duzenle/:id" element={
            <Navigate to={`/ads/edit/${window.location.pathname.split('/').pop()}`} replace />
          } />
          
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          <Route path="/profil" element={
            <Navigate to="/profile" replace />
          } />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Route>
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }>
          <Route index element={<AdminDashboard />} />
          
          {/* Categories Management Routes */}
          <Route path="categories" element={<AdminCategories />} />
          <Route path="kategoriler" element={<Navigate to="/admin/categories" replace />} />
          
          <Route path="categories/create-main" element={<CreateMainCategory />} />
          <Route path="categories/create-sub" element={<CreateSubCategory />} />
          <Route path="categories/create" element={<CreateCategory />} />
          
          {/* Locations Management Routes */}
          <Route path="locations" element={<AdminLocations />} />
          <Route path="lokasyonlar" element={<Navigate to="/admin/locations" replace />} />
          
          <Route path="locations/create" element={<CreateLocation />} />
          
          {/* Ads Management Routes */}
          <Route path="ads/pending" element={<AdminPendingAds />} />
          
          {/* Reports Management Routes */}
          <Route path="reports" element={<ReportsList />} />
          <Route path="reports/:id" element={<ReportDetail />} />
          
          {/* Admin 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <ToastContainer position="top-right" autoClose={1200} />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
