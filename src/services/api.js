import axios from 'axios';

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

// API URL
const API_URL = 'http://localhost:5097/api';
// Token anahtarı
const ACCESS_TOKEN_KEY = 'accessToken';

// Token yardımcı fonksiyonları - döngüsel bağımlılığı önlemek için authService.js'ten bağımsız
const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
const setAccessToken = (token) => {
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
};

// API instance oluştur
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true // CORS cookie'ler için
});

// İstek interceptor
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (process.env.NODE_ENV === 'development') {
      const logData = {
        method: config.method?.toUpperCase(),
        url: config.url,
        withCredentials: config.withCredentials
      };
      
      // Hassas veri içerebilecek gereksiz detayları filtreleme
      if (config.url !== '/Auth/Login') {
        logData.headers = { ...config.headers };
        delete logData.headers.Authorization; // Token değerini loglama
        logData.data = config.data;
      }
      
      logInfo('Request', logData);
    }
    
    return config;
  },
  (error) => {
    logError('RequestError', error);
    return Promise.reject(error);
  }
);

// Refresh token mekanizması
let isRefreshingToken = false;
let refreshSubscribers = [];

// Yeni token alındığında bekleyen istekleri çöz
const onTokenRefreshed = (token) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

// Token yenilenene kadar yeni istekleri beklet
const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

// Yanıt interceptor
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      logInfo('Response', {
        status: response.status,
        url: response.config.url,
        data: response.data
      });
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Refresh token isteği zaten yapılıyorsa
      if (isRefreshingToken) {
        // Bu isteği beklet ve token yenilendiğinde tekrar dene
        return new Promise((resolve) => {
          addRefreshSubscriber((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }
      
      originalRequest._retry = true;
      isRefreshingToken = true;
      
      try {
        logInfo('TokenRefresh', 'Token yenileme isteği yapılıyor');
        
        // Refresh token isteğini direkt axios ile yap (api instance'ı kullanmadan)
        // Böylece interceptor'ların tekrar çalışmasını önle
        const refreshResponse = await axios.post(
          `${API_URL}/Auth/RefreshTokenLogin`, 
          {}, 
          { 
            withCredentials: true,
            headers: { 'Content-Type': 'application/json' }
          }
        );
          
        if (refreshResponse.data && refreshResponse.data.token) {
          const newToken = refreshResponse.data.token;
          logInfo('TokenRefresh', 'Token yenilendi');
          
          // Token'ı kaydet
          setAccessToken(newToken);
          
          // Orijinal isteği ve bekleyen diğer istekleri yeni token ile tekrarla
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          onTokenRefreshed(newToken);
          
          return api(originalRequest);
        } else {
          // Token alınamadı, kullanıcıyı logout yap
          logError('TokenRefresh', 'Token yanıtı geçersiz');
          setAccessToken(null); // Token'ı temizle
          window.location.href = '/login'; // Login sayfasına yönlendir
          return Promise.reject(new Error('Token yenileme başarısız: Geçersiz yanıt'));
        }
      } catch (refreshError) {
        logError('TokenRefresh', refreshError);
        setAccessToken(null); // Token'ı temizle
        window.location.href = '/login'; // Login sayfasına yönlendir
        return Promise.reject(refreshError);
      } finally {
        isRefreshingToken = false;
      }
    }
    
    // Diğer hataları logla
    if (error.response) {
      logError('ResponseError', {
        status: error.response.status,
        url: originalRequest?.url,
        data: error.response.data
      });
    } else {
      logError('NetworkError', {
        message: error.message,
        url: originalRequest?.url
      });
    }
    
    return Promise.reject(error);
  }
);

// API ile birlikte token yardımcı fonksiyonlarını da export et
export { getAccessToken, setAccessToken };
export default api; 