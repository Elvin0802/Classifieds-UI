import React, { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import authService from '../services/authService';
import authStorage from '../services/authStorage';
import profileService from '../services/profileService';
import { toast } from 'react-toastify';

// Context oluşturma
export const AuthContext = createContext();

// Auth provider bileşeni
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Uygulama başladığında kimlik doğrulama verilerini yükle
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // localStorage'dan kimlik doğrulama verilerini yükle
        authStorage.initializeAuthData();
        
        // Oturum durumunu kontrol et
        const isLoggedIn = authStorage.getIsLogin();
        setIsAuthenticated(isLoggedIn);
        
        if (isLoggedIn) {
          // Admin durumu ve kullanıcı ID'sini al
          setIsAdmin(authStorage.getIsAdmin());
          setUserId(authStorage.getUserId());
          
          // Kullanıcı verilerini getir
          await fetchUserData();
        }
      } catch (error) {
        console.error('Kimlik doğrulama başlatılırken hata:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  // Kullanıcı verilerini getir
  const fetchUserData = async () => {
    try {
      const response = await profileService.getUserData();
      if (response.isSucceeded && response.data?.item) {
        const userData = response.data.item;
        setUser(userData);
        
        // ID ve admin durumunu güncelle
        setUserId(userData.id);
        setIsAdmin(userData.isAdmin);
        
        // Storage'ı güncelle
        authStorage.setUserId(userData.id);
        authStorage.setIsAdmin(userData.isAdmin);
      }
    } catch (error) {
      console.error('Kullanıcı bilgileri alınırken hata:', error);
    }
  };

  // Giriş yap
  const login = async (credentials) => {
    try {
      // Login işlemi authService tarafından yapılmış olmalı
      // Token ve yanıt axiosConfig tarafından işlenmiş olacak
      // Oturum durumunu güncelle
      authStorage.setIsLogin(true);
      setIsAuthenticated(true);
      
      // Kullanıcı verilerini getir
      await fetchUserData();
      
      return true;
    } catch (error) {
      console.error('Context güncelleme hatası:', error);
      return false;
    }
  };

  // Çıkış yap
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Çıkış yapılırken hata:', error);
    } finally {
      // localStorage'dan kimlik doğrulama verilerini temizle
      authStorage.clear();
      
      // State'i güncelle
      setIsAuthenticated(false);
      setUserId(null);
      setIsAdmin(false);
      setUser(null);
      
      toast.info('Çıkış yaptınız');
    }
  };

  // Değerleri sağla
  const value = {
    isAuthenticated,
    isAdmin,
    userId,
    user,
    loading,
    login,
    logout,
    fetchUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  return useContext(AuthContext);
}; 