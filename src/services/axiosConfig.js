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

// API temel URL'i
const API_URL = 'http://localhost:5097/api';

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
    
    // Token süresi dolmuşsa ve henüz retry yapılmamışsa
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        logInfo('TokenRefresh', 'Token yenileme başladı');
        
        // Refresh token ile yeni token alalım
        const response = await axios.post(
          `${API_URL}/Auth/RefreshTokenLogin`, 
          {}, 
          {
            withCredentials: true // Cookie'leri göndermek için
          }
        );
        
        // Yeni token'ı localStorage'a kaydet
        if (response.data?.token) {
          localStorage.setItem('accessToken', response.data.token);
          logInfo('TokenRefresh', 'Token başarıyla yenilendi');
          
          // Orijinal isteği yeni token ile tekrarla
          originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
          return apiClient(originalRequest);
        } else {
          throw new Error('Token yanıtı geçersiz format');
        }
      } catch (refreshError) {
        logError('TokenRefresh', refreshError);
        
        // Refresh token da geçersizse localStorage'ı temizle
        localStorage.removeItem('accessToken');
        localStorage.setItem('isLogin', 'false');
        localStorage.setItem('isAdmin', 'false');
        localStorage.removeItem('userId');
        
        // Kullanıcıyı login sayfasına yönlendir
        if (window.location.pathname !== '/login' && window.location.pathname !== '/giris') {
          window.location.href = '/giris';
        }
        
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