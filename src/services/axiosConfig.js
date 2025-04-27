import axios from 'axios';
import { API_URL } from '../config';
import authService from '../services/authService';
import authStorage from '../services/authStorage';

const logError = (source, error) => {
  console.error(`[API] ${source}:`, {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
    stack: error.stack
  });
};

const logInfo = (source, data) => {
  if (process.env.NODE_ENV === 'development') {
    console.info(`[API] ${source}:`, data);
  }
};

// Token yönetimi
let accessToken = null;

// Token'ı localStorage'dan al (sayfa yenilendikten sonra)
const STORAGE_TOKEN_KEY = 'auth_access_token';

// Initial token yükleme
try {
  const storedToken = localStorage.getItem(STORAGE_TOKEN_KEY);
  if (storedToken) {
    accessToken = storedToken;
    console.log('Token localStorage\'dan yüklendi');
  }
} catch (error) {
  console.error('Token yüklenirken hata:', error);
}

export const setAccessToken = (token) => {
  accessToken = token;
  // Token'ı localStorage'a kaydet
  try {
    if (token) {
      localStorage.setItem(STORAGE_TOKEN_KEY, token);
      console.log('Token localStorage\'a kaydedildi');
    } else {
      localStorage.removeItem(STORAGE_TOKEN_KEY);
      console.log('Token localStorage\'dan silindi');
    }
  } catch (error) {
    console.error('Token localStorage işlemi sırasında hata:', error);
  }
};

export const getAccessToken = () => {
  // Eğer bellekte yoksa, localStorage'dan almayı dene
  if (!accessToken) {
    try {
      const storedToken = localStorage.getItem(STORAGE_TOKEN_KEY);
      if (storedToken) {
        accessToken = storedToken;
        console.log('Token localStorage\'dan tekrar yüklendi');
      }
    } catch (error) {
      console.error('Token tekrar yüklenirken hata:', error);
    }
  }
  return accessToken;
};

export const clearAccessToken = () => {
  accessToken = null;
  // localStorage'dan da temizle
  try {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    console.log('Token localStorage\'dan temizlendi');
  } catch (error) {
    console.error('Token temizlerken hata:', error);
  }
};

// Public endpoint'ler - token gerektirmeyen API endpoint'leri
const PUBLIC_ENDPOINTS = [
  '/Auth/Login',
  '/Auth/Register',
  '/Auth/RefreshTokenLogin',
  '/Auth/ForgotPassword',
  '/Auth/ResetPassword',
  '/Categories/all',
  '/Categories/byId',
  '/Locations/GetAll',
  '/Locations/GetById',
  '/Locations/GetDistricts',
  '/Advertisements/GetAll',
  '/Advertisements/GetById',
  '/Advertisements/GetFeatured',
  '/Advertisements/Search'
];

// Endpoint public mi kontrol eden yardımcı fonksiyon
const isPublicEndpoint = (url) => {
  if (!url) return false;
  return PUBLIC_ENDPOINTS.some(endpoint => url.includes(endpoint));
};

// Axios instance oluşturma
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true // CORS cookie'ler için
});

// İstek interceptor - her istekte token ekleme
apiClient.interceptors.request.use(
  (config) => {
    // Public endpoint ise ve token yoksa istek yapılabilir, hata fırlatma
    // Token varsa ekle, yoksa ve public endpoint ise token eklemeden devam et
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    logInfo('Request', {
      method: config.method?.toUpperCase(),
      url: config.url,
      withCredentials: config.withCredentials,
      isPublic: isPublicEndpoint(config.url)
    });
    
    return config;
  },
  (error) => {
    logError('RequestError', error);
    return Promise.reject(error);
  }
);

// Yanıt interceptor - token yenileme
apiClient.interceptors.response.use(
  (response) => {
    logInfo('Response', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    
    // Login veya RefreshTokenLogin yanıtlarından token çıkarma
    if ((response.config.url?.includes('/Auth/Login') || 
         response.config.url?.includes('/Auth/RefreshTokenLogin')) && 
        response.data?.isSucceeded) {
        
      // Token API'de data alanında string olarak geliyor
      if (typeof response.data.data === 'string') {
        setAccessToken(response.data.data);
        logInfo('TokenSave', 'Token kaydedildi (API data string)');
      }
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Eğer bu bir RefreshTokenLogin isteğiyse ve 401 hatası alındıysa, oturumu hemen temizle
    if (error.response && 
        error.response.status === 401 && 
        originalRequest.url.includes('/auth/RefreshTokenLogin')) {
      
      console.log('RefreshTokenLogin 401 hatası - oturum temizleniyor');
      clearAccessToken();
      authStorage.clear();
      
      // Oturum süresi doldu hatası oluştur
      const sessionExpiredError = new Error('Oturum süreniz dolmuş veya geçersiz. Lütfen tekrar giriş yapın.');
      sessionExpiredError.isSessionExpired = true;
      
      // 2 saniye sonra login sayfasına yönlendir
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      
      return Promise.reject(sessionExpiredError);
    }
    
    // Public endpoint'ler için 401 hatası durumunda token yenileme deneme
    // Direkt hatayı döndür, kullanıcı login olmadan da erişebilmeli
    if (error.response && 
        error.response.status === 401 && 
        isPublicEndpoint(originalRequest.url)) {
      
      console.log('Public endpoint için 401 hatası, token yenileme atlanıyor');
      return Promise.reject(error);
    }
    
    // Eğer hata 401 (Yetkisiz) ise ve bu istek daha önce yenilenmemiş ise token'ı yenilemeyi dene
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/RefreshTokenLogin') // RefreshTokenLogin isteği değilse
    ) {
      originalRequest._retry = true;
      
      // Kullanıcı login durumunu kontrol et
      const isLoginActive = authStorage.getIsLogin();
      
      // Kullanıcı login değilse, token yenileme deneme
      if (!isLoginActive) {
        console.log('Kullanıcı giriş yapmamış, token yenileme atlanıyor');
        return Promise.reject(error);
      }
      
      try {
        // authService kullanarak token'ı yenile
        const refreshSuccess = await authService.refreshTokenLogin();
        
        if (refreshSuccess) {
          // Token yenilemesi başarılı ise, orijinal isteği tekrar gönder
          // Yeni token otomatik olarak header'a eklenecek
          return apiClient(originalRequest);
        } else {
          // Token yenilemesi başarısız ise, kullanıcıyı login sayfasına yönlendir
          console.log('Token yenilemesi başarısız oldu, kullanıcı login sayfasına yönlendirilecek');
          
          // Token'ı ve oturum durumunu tamamen temizle
          clearAccessToken();
          authStorage.clear();
          
          // 2 saniye sonra login sayfasına yönlendir
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
          
          // Oturum süresi doldu hatası oluştur
          const sessionExpiredError = new Error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
          sessionExpiredError.isSessionExpired = true;
          return Promise.reject(sessionExpiredError);
        }
      } catch (refreshError) {
        console.error('Token yenileme hatası:', refreshError);
        
        // Token yenileme hatası durumunda login sayfasına yönlendir
        clearAccessToken();
        authStorage.clear();
        
        // 2 saniye sonra login sayfasına yönlendir
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        
        return Promise.reject(refreshError);
      }
    }
    
    // Diğer hata durumları için
    return Promise.reject(error);
  }
);

export default apiClient;