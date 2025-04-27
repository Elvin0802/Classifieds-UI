import React, { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import authService from '../services/authService';
import authStorage from '../services/authStorage';
import profileService from '../services/profileService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { getAccessToken, clearAccessToken } from '../services/axiosConfig';

// Context oluşturma
export const AuthContext = createContext();

// Auth provider bileşeni
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Token decode fonksiyonu
  const decodeToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      const isUserAdmin = decoded.role && (Array.isArray(decoded.role) 
        ? decoded.role.includes('Admin') 
        : decoded.role === 'Admin');
      
      const userIdFromToken = decoded.sub || decoded.userId || decoded.nameid;
      
      return { isUserAdmin, userIdFromToken };
    } catch (error) {
      console.error('Token decode hatası:', error);
      return { isUserAdmin: false, userIdFromToken: null };
    }
  };

  // Kullanıcıyı çıkış yaptır
  const handleForceLogout = () => {
    // Zaten authentication false ise gereksiz işlem yapma
    if (!isAuthenticated) {
      console.log('handleForceLogout: Kullanıcı zaten giriş yapmamış, işlem atlanıyor');
      return;
    }
    
    console.log('handleForceLogout: Oturum sonlandırılıyor');
    
    // State'leri temizle
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUser(null);
    setUserId(null);
    
    // Token'ı temizle
    clearAccessToken();
    
    // LocalStorage'ı temizle
    authStorage.clear();
    
    // Kullanıcıya bildirim göster
    toast.error('Oturumunuz sonlandırıldı. Lütfen tekrar giriş yapın.');
    
    // Login sayfasına yönlendir
    navigate('/login', { state: { from: window.location.pathname }, replace: true });
  };

  // Yardımcı fonksiyon: Kullanıcı profilini getir
  const fetchUserProfile = async () => {
    try {
      const profileResponse = await profileService.getUserData();
      
      if (profileResponse && profileResponse.isSucceeded && profileResponse.data?.item) {
        const userData = profileResponse.data.item;
        setUser(userData);
        setUserId(userData.id);
        setIsAdmin(userData.isAdmin);
        authStorage.setIsAdmin(userData.isAdmin);
        console.log('Kullanıcı profil bilgileri başarıyla alındı');
        return true; // Profil başarıyla alındı
      }
    } catch (profileError) {
      console.error('Profil bilgisi alınırken hata:', profileError);
      
      // 401 hatası durumunda oturumu temizle, ancak handleForceLogout KULLANMA
      // handleForceLogout sayfayı login'e yönlendiriyor, bu da döngü oluşturabilir
      if (profileError.response && profileError.response.status === 401) {
        console.log('Profile API 401 hatası, token geçersiz olabilir, ancak hemen temizlemiyoruz');
        // Sadece hatayı bildir, token hala geçerli olabilir
        return false; // Profil alınamadı
      }
      
      // 401 dışındaki hatalarda profili alamadık ama oturumu kapatmıyoruz
      // İşlem devam edebilir, token hala geçerli olabilir
      return false; // Profil alınamadı ama token geçerli olabilir
    }
  };

  // Kimlik doğrulama durumunu kontrol et
  useEffect(() => {
    // Aynı anda birden fazla auth kontrolü yapılmasını engellemek için
    let isAuthCheckInProgress = false;
    
    const checkAuth = async () => {
      // Eğer zaten bir kontrol devam ediyorsa, yeni kontrol başlatma
      if (isAuthCheckInProgress) return;
      
      isAuthCheckInProgress = true;
      setLoading(true);
      
      try {
        // LocalStorage'dan login durumunu kontrol et
        const storedIsLogin = authStorage.getIsLogin();
        
        // Token kontrol et
        const token = getAccessToken();
        
        // Hem token hem login durumu var mı kontrol et
        const isValidSession = storedIsLogin && token;
        
        console.log('Auth kontrol:', 
          storedIsLogin ? 'Login aktif' : 'Login aktif değil',
          token ? 'Token var' : 'Token yok'
        );
        
        // Geçerli bir oturum yoksa temizlik yap
        if (!isValidSession) {
          console.log('Geçerli oturum bulunamadı, state temizleniyor');
          setIsAuthenticated(false);
          setIsAdmin(false);
          setUser(null);
          setUserId(null);
          
          // LocalStorage'da login var ama token yoksa, localStorage'ı da temizle
          if (storedIsLogin && !token) {
            console.log('Token yok ama login aktif görünüyor, tüm oturum bilgileri temizleniyor');
            authStorage.clear();
            clearAccessToken();
          }
          
          isAuthCheckInProgress = false;
          setLoading(false);
          return;
        }
        
        // Token ve login durumu varsa, kullanıcıyı giriş yapmış olarak kabul et
        if (isValidSession) {
          console.log('Geçerli oturum bulundu, kullanıcı giriş yapmış kabul ediliyor');
          
          // Minimal auth state güncellemesi yap
          setIsAuthenticated(true);
          setIsAdmin(authStorage.getIsAdmin());
          
          // İşlem tamamlandı
          isAuthCheckInProgress = false;
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('Auth kontrolü sırasında hata:', error);
        // Genel hata durumunda tüm state'leri temizle
        setIsAuthenticated(false);
        setIsAdmin(false);
        setUser(null);
        setUserId(null);
        
        // Ayrıca localStorage'ı da temizle
        authStorage.clear();
        clearAccessToken();
      } finally {
        isAuthCheckInProgress = false;
        setLoading(false);
      }
    };
    
    // Auth kontrolünü başlat
    checkAuth();
    
    // Sayfa yenileme kontrolü için event listener ekleyelim
    const handlePageRefresh = () => {
      console.log('Sayfa yenileme algılandı, auth durumu korunuyor');
      // Sayfa yenilendiğinde localStorage'daki login durumunu koruyoruz
      // checkAuth fonksiyonu zaten sayfa yüklendiğinde çalışacak
    };
    
    // Beforeunload olayını dinle
    window.addEventListener('beforeunload', handlePageRefresh);
    
    // Navigation event dinleyicisi ekle - sayfa değişimlerinde auth durumunu koru
    const handleNavigation = () => {
      console.log('Sayfa navigasyonu algılandı, auth durumu kontrol ediliyor');
      // Navigasyon sırasında auth durumunu kontrol et
      if (!isAuthCheckInProgress && isAuthenticated) {
        console.log('Navigasyon sırasında auth durumu: Aktif, durumu koruyoruz');
      }
    };
    
    window.addEventListener('popstate', handleNavigation);
    
    // Temizlik fonksiyonu
    return () => {
      window.removeEventListener('beforeunload', handlePageRefresh);
      window.removeEventListener('popstate', handleNavigation);
    };
  }, [navigate]);

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
        
        // Storage'ı güncelle (sadece admin bilgisi)
        authStorage.setIsAdmin(userData.isAdmin);
      }
    } catch (error) {
      console.error('Kullanıcı bilgileri alınırken hata:', error);
      
      // 401 hatası durumunda oturumu sonlandır
      if (error.response && error.response.status === 401) {
        handleForceLogout();
      }
    }
  };

  // Giriş yap
  const login = async (credentials) => {
    try {
      // API'ye login isteği gönder
      const response = await authService.login(credentials);
      
      console.log('Login API Yanıtı:', response);
      
      // API response formatının analizi
      // API yanıtı yapısı:
      // { 
      //   "data": "JWT_TOKEN_STRING",
      //   "isSucceeded": true,
      //   "message": "Login successfully completed.",
      //   "isFailed": false 
      // }
      
      // Token direkt string olarak data alanında geliyor
      const token = response && response.isSucceeded && typeof response.data === 'string' ? response.data : null;
      
      console.log('Token kontrolü:', token ? 'Token bulundu' : 'Token bulunamadı');
      
      if (token) {
        console.log('Token bulundu:', token.substring(0, 20) + '...');
        
        // Token'ı belleğe kaydet (authService içinde yapılıyor)
        
        // AuthContext durumunu güncelle
        setIsAuthenticated(true);
        
        // Token'dan bilgileri çıkar
        const { isUserAdmin, userIdFromToken } = decodeToken(token);
        console.log('Token bilgileri:', { isUserAdmin, userIdFromToken });
        
        setIsAdmin(isUserAdmin);
        setUserId(userIdFromToken);
        
        // Admin durumunu kaydet
        authStorage.setIsAdmin(isUserAdmin);
        
        // API'den profil bilgilerini getir
        try {
          const profileResponse = await profileService.getUserData();
          
          // Profil bilgileri başarıyla alındıysa
          if (profileResponse && profileResponse.isSucceeded && profileResponse.data?.item) {
            const userData = profileResponse.data.item;
            
            // Kullanıcı verilerini state'e ayarla
            setUser(userData);
            setUserId(userData.id);
            setIsAdmin(userData.isAdmin);
            
            // Admin bilgisini güncelle
            authStorage.setIsAdmin(userData.isAdmin);
          }
        } catch (profileError) {
          console.error('Profil bilgileri alınırken hata:', profileError);
        }
        
        return { success: true };
      }
      
      // Başarısız durum
      return { 
        success: false, 
        message: response?.message || 'Giriş başarısız.' 
      };
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

  // Context değerlerini sağla
  const contextValues = {
    isAuthenticated,
    isAdmin,
    user,
    userId,
    loading,
    login,
    logout,
    fetchUserData,
    handleForceLogout
  };

  return (
    <AuthContext.Provider value={contextValues}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => {
  return useContext(AuthContext);
}; 