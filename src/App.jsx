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
import AdsList from './pages/ads/AdsList';
import AdDetail from './pages/ads/AdDetail';
import CreateAd from './pages/ads/CreateAd';
import Profile from './pages/profile/Profile';
import SelectedAds from './pages/ads/SelectedAds';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';

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
  const { isAuthenticated, isAdmin } = useContext(AuthContext);
  
  if (!isAuthenticated) {
    toast.error('Bu sayfayı görüntülemek için giriş yapmalısınız');
    return <Navigate to="/login" state={{ from: window.location.pathname }} />;
  }
  
  if (!isAdmin) {
    toast.error('Bu sayfayı görüntülemek için yetkiniz bulunmamaktadır');
    return <Navigate to="/" />;
  }
  
  return children;
};

function AppContent() {
  useEffect(() => {
    // Axios interceptor'ları ayarla
    authService.setupInterceptors();
  }, []);
  
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
          
          {/* İlan Routes - İngilizce ve Türkçe */}
          <Route path="/ads" element={<AdsList />} />
          <Route path="/ilanlar" element={<AdsList />} />
          <Route path="/ads/:id" element={<AdDetail />} />
          <Route path="/ilanlar/:id" element={<AdDetail />} />
          <Route path="/ads/selected" element={<SelectedAds />} />
          <Route path="/ilanlar/favori" element={<SelectedAds />} />
          
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
          <Route path="*" element={<div className="container mx-auto py-10 text-center"><h1 className="text-2xl font-bold">404 - Sayfa Bulunamadı</h1></div>} />
        </Route>
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }>
          <Route index element={<AdminDashboard />} />
          {/* Diğer admin sayfaları buraya eklenecek */}
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
