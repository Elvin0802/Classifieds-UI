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

  // Token decode fonksiyonu
  const decodeToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      const isUserAdmin = decoded.role && (Array.isArray(decoded.role) 
        ? decoded.role.includes('Admin') 
        : decoded.role === 'Admin');
      
      const userIdFromToken = decoded.sub || decoded.userId || decoded.nameid;
      
      console.log('Token decode edildi:', { 
        isUserAdmin, 
        userIdFromToken,
        role: decoded.role
      });
      
      return { isUserAdmin, userIdFromToken };
    } catch (error) {
      console.error('Token decode hatası:', error);
      return { isUserAdmin: false, userIdFromToken: null };
    }
  };

  // Kimlik doğrulama durumunu kontrol et
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      
      try {
        // Token kontrolü yap
        const token = localStorage.getItem('accessToken');
        
        if (token) {
          console.log('localStorage\'da token bulundu, kullanıcı doğrulanıyor');
          
          // Token'dan bilgileri çıkar
          const { isUserAdmin, userIdFromToken } = decodeToken(token);
          
          // Auth state'i güncelle
          setIsAuthenticated(true);
          setIsAdmin(isUserAdmin);
          setUserId(userIdFromToken);
          
          // LocalStorage'ı güncelle
          authStorage.setIsLogin(true);
          authStorage.setIsAdmin(isUserAdmin);
          if (userIdFromToken) authStorage.setUserId(userIdFromToken);
          
          console.log('Token bilgileri güncellendi:', { isUserAdmin, userIdFromToken });
          
          // API'den kullanıcı bilgilerini getir
          try {
            const profileResponse = await profileService.getUserData();
            
            if (profileResponse && profileResponse.isSucceeded && profileResponse.data?.item) {
              const userData = profileResponse.data.item;
              
              // Kullanıcı verilerini güncelle
              setUser(userData);
              setUserId(userData.id);
              setIsAdmin(userData.isAdmin);
              
              // LocalStorage'ı güncelle
              authStorage.setIsAdmin(userData.isAdmin);
              authStorage.setUserId(userData.id);
              
              console.log('API\'den kullanıcı bilgileri alındı:', userData.name, userData.isAdmin);
            }
          } catch (profileError) {
            console.error('Profil bilgisi alınırken hata:', profileError);
            // Hata durumunda token bilgilerini kullan, logout yapma
          }
        } else {
          console.log('Token bulunamadı, autoLogin kontrol ediliyor');
          
          // Token yoksa veya geçersizse otomatik giriş dene
          const isLoggedIn = await authService.autoLogin();
          
          if (isLoggedIn) {
            console.log('AutoLogin başarılı, yeni token alındı');
            const newToken = localStorage.getItem('accessToken');
            
            if (newToken) {
              const { isUserAdmin, userIdFromToken } = decodeToken(newToken);
              
              // Auth state'i güncelle
              setIsAuthenticated(true);
              setIsAdmin(isUserAdmin);
              setUserId(userIdFromToken);
              
              // LocalStorage'ı güncelle
              authStorage.setIsLogin(true);
              authStorage.setIsAdmin(isUserAdmin);
              if (userIdFromToken) authStorage.setUserId(userIdFromToken);
              
              // API'den kullanıcı bilgilerini getir
              try {
                const profileResponse = await profileService.getUserData();
                
                if (profileResponse && profileResponse.isSucceeded && profileResponse.data?.item) {
                  setUser(profileResponse.data.item);
                }
              } catch (profileError) {
                console.error('AutoLogin sonrası profil bilgisi alınamadı:', profileError);
              }
            }
          } else {
            console.log('AutoLogin başarısız, kullanıcı çıkış yaptı');
            // AutoLogin başarısız, çıkış yap
            setIsAuthenticated(false);
            setIsAdmin(false);
            setUserId(null);
            setUser(null);
            authStorage.clear();
          }
        }
      } catch (error) {
        console.error('Kimlik doğrulama kontrolü sırasında hata:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
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
      // API'ye login isteği gönder
      const response = await authService.login(credentials);
      
      // Eğer başarılı bir yanıt ve token varsa
      if (response && response.token) {
        // AuthContext durumunu güncelle
        setIsAuthenticated(true);
        
        // Token'dan bilgileri çıkar
        const { isUserAdmin, userIdFromToken } = decodeToken(response.token);
        setIsAdmin(isUserAdmin);
        setUserId(userIdFromToken);
        
        // API'den profil bilgilerini getir
        try {
          const profileResponse = await profileService.getUserData();
          
          // Profil bilgileri başarıyla alındıysa
          if (profileResponse && profileResponse.isSucceeded && profileResponse.data?.item) {
            const userData = profileResponse.data.item;
            
            // Kullanıcı verilerini state'e ayarla
            setUser(userData);
            setUserId(userData.id);
            
            // isAdmin değerini API'den gelen veri ile ayarla
            setIsAdmin(userData.isAdmin);
            
            // LocalStorage'a değerleri kaydet
            authStorage.setIsLogin(true);
            authStorage.setIsAdmin(userData.isAdmin);
            authStorage.setUserId(userData.id);
            
            console.log('Kullanıcı girişi başarılı:', userData.name);
            console.log('Admin durumu:', userData.isAdmin ? 'Evet' : 'Hayır');
          } else {
            console.error('Profil bilgileri alınamadı');
            
            // Profil bilgisi alınamazsa token bilgilerini kullan
            authStorage.setIsLogin(true);
            authStorage.setIsAdmin(isUserAdmin);
            authStorage.setUserId(userIdFromToken);
          }
        } catch (profileError) {
          console.error('Profil bilgileri alınırken hata:', profileError);
          
          // Profil bilgisi alınamazsa token bilgilerini kullan
          authStorage.setIsLogin(true);
          authStorage.setIsAdmin(isUserAdmin);
          authStorage.setUserId(userIdFromToken);
        }
        
        return { success: true };
      } else {
        return { success: false, message: 'Giriş başarısız.' };
      }
    } catch (error) {
      console.error('Giriş sırasında hata:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Giriş işlemi sırasında bir hata oluştu.' 
      };
    }
  };

  // Çıkış yap
  const logout = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setIsAdmin(false);
      setUser(null);
      setUserId(null);
      return { success: true };
    } catch (error) {
      console.error('Çıkış sırasında hata:', error);
      // Hata olsa bile stateler temizlenir
      setIsAuthenticated(false);
      setIsAdmin(false);
      setUser(null);
      setUserId(null);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Çıkış işlemi sırasında bir hata oluştu.' 
      };
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