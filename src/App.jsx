import React, { useEffect, useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { AuthProvider, AuthContext } from './contexts/AuthContext';

// Layout
import Layout from './components/layout/Layout';

// Pages
import Home from './pages/home/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import AdsList from './pages/ads/AdsList';
import AdDetail from './pages/ads/AdDetail';
import CreateAd from './pages/ads/CreateAd';
import Profile from './pages/profile/Profile';
import SelectedAds from './pages/ads/SelectedAds';
import NotFound from './pages/NotFound';

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
// import AdminReports from './pages/admin/reports/AdminReports';

// Services
import authService from './services/authService';

// Private Route Component
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  
  if (!isAuthenticated) {
    toast.error('Bu sayfayı görüntülemek için giriş yapmalısınız');
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
  
  // Token varsa ve localStorage'da admin bilgisi varsa yetkilendir
  const token = localStorage.getItem('accessToken');
  const localStorageIsAdmin = localStorage.getItem('isAdmin') === 'true';
  
  if (token && (isAdmin || localStorageIsAdmin)) {
    console.log('AdminRoute - Erişim izni verildi (token ve admin kontrolü)');
    return children;
  }
  
  // Kimlik doğrulaması yapılmamışsa login sayfasına yönlendir
  if (!isAuthenticated && !token) {
    console.log('AdminRoute - Kimlik doğrulama başarısız');
    toast.error('Bu sayfayı görüntülemek için giriş yapmalısınız');
    return <Navigate to="/login" state={{ from: window.location.pathname }} />;
  }
  
  // Kullanıcı giriş yapmış ama admin değilse ana sayfaya yönlendir
  console.log('AdminRoute - Admin yetkisi yok');
  toast.error('Bu sayfayı görüntülemek için yetkiniz bulunmamaktadır');
  return <Navigate to="/" />;
};

function AppContent() {
  // useEffect kısmını kaldırdım çünkü setupInterceptors fonksiyonu authService içinde tanımlanmış değil
  // Interceptor işlemleri zaten axiosConfig.js içinde otomatik olarak yapılandırılmış durumda
  
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Public Routes */}
          <Route index element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/giris" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/kayit" element={<Register />} />
          
          {/* Şifre Sıfırlama Routes */}
          <Route path="/sifremi-unuttum" element={<ForgotPassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/sifre-sifirlama" element={<ResetPassword />} />
          <Route path="/update-password/:userId/:token" element={<ResetPassword />} />
          
          {/* İlan Routes - İngilizce ve Türkçe */}
          <Route path="/ads" element={<AdsList />} />
          <Route path="/ilanlar" element={<AdsList />} />
          <Route path="/ads/:id" element={<AdDetail />} />
          <Route path="/ilanlar/:id" element={<AdDetail />} />
          <Route path="/ads/selected" element={<SelectedAds />} />
          <Route path="/ilanlar/favori" element={<SelectedAds />} />
          
          {/* Info Pages */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/help" element={<HelpPage />} />
          
          {/* Protected Routes */}
          <Route path="/ads/create" element={
            <PrivateRoute>
              <CreateAd />
            </PrivateRoute>
          } />
          <Route path="/ilanlar/yeni" element={
            <PrivateRoute>
              <CreateAd />
            </PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          <Route path="/profil" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
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
          
          {/* Kategori Yönetimi Routes */}
          <Route path="categories" element={<AdminCategories />} />
          <Route path="categories/create-main" element={<CreateMainCategory />} />
          <Route path="categories/create-sub" element={<CreateSubCategory />} />
          <Route path="categories/create" element={<CreateCategory />} />
          
          {/* Lokasyon Yönetimi Routes */}
          <Route path="locations" element={<AdminLocations />} />
          <Route path="locations/create" element={<CreateLocation />} />
          
          {/* Rapor Yönetimi Routes */}
          {/* <Route path="reports" element={<AdminReports />} /> */}
          
          {/* Admin 404 Route */}
          <Route path="*" element={<div className="p-6"><h1 className="text-2xl font-bold text-center">404 - Admin Sayfası Bulunamadı</h1></div>} />
        </Route>
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
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
