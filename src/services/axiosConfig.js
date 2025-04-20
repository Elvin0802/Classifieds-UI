import axios from 'axios';
import { API_URL } from '../config';

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
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    logInfo('Request', {
      method: config.method?.toUpperCase(),
      url: config.url,
      withCredentials: config.withCredentials
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
    
    // Login yanıtından token'ı çıkarıp localStorage'a kaydet
    if (response.config.url?.includes('/Auth/Login') && response.data?.token) {
      localStorage.setItem('accessToken', response.data.token);
      logInfo('TokenSave', 'Login yanıtından token kaydedildi');
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Eğer 401 hatası alındıysa ve bu request daha önce yenilenmemişse
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        logInfo('TokenRefresh', 'Token yenileme başladı');
        
        // Refresh token ile yeni token al
        const refreshResponse = await axios.post(`${API_URL}/Auth/RefreshTokenLogin`, {}, {
          withCredentials: true // Cookie'leri göndermek için gerekli
        });
        
        // Yeni token'ı localStorage'a kaydet
        if (refreshResponse.data && refreshResponse.data.token) {
          localStorage.setItem('accessToken', refreshResponse.data.token);
          logInfo('TokenRefresh', 'Token başarıyla yenilendi');
          
          // Oturum durumunu koru - LocalStorage'da giriş ve admin durumunu ayarla
          localStorage.setItem('isLogin', 'true');
          
          // Orijinal isteği yeni token ile tekrar gönder
          originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
          return apiClient(originalRequest);
        } else {
          throw new Error('Token yanıtı geçersiz format');
        }
      } catch (refreshError) {
        logError('TokenRefresh', refreshError);
        
        // Token yenilemesi başarısız olsa bile kullanıcıyı giriş sayfasına yönlendirme
        // AuthContext'in kendi kontrolünü yapmasına izin ver
        console.log('Token yenilemesi başarısız oldu, ancak oturum durumu korunuyor');
        
        return Promise.reject(refreshError);
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

export default apiClient; 