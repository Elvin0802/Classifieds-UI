import api, { getAccessToken, setAccessToken } from './api';

const logError = (methodName, error) => {
  console.error(`[AuthService] ${methodName} hatası:`, {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
    stack: error.stack
  });
};

const logInfo = (methodName, data) => {
  if (process.env.NODE_ENV === 'development') {
    console.info(`[AuthService] ${methodName}:`, data);
  }
};

// Kullanıcı rol bilgisini saklamak için
const USER_ROLE_KEY = 'userRole';

// Kullanıcı rollerini tanımla
const ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};

// Rol yardımcı fonksiyonları
const getUserRole = () => localStorage.getItem(USER_ROLE_KEY) || ROLES.USER;
const setUserRole = (role) => {
  if (role) {
    localStorage.setItem(USER_ROLE_KEY, role);
  } else {
    localStorage.removeItem(USER_ROLE_KEY);
  }
};

const authService = {
  // Kullanıcı girişi
  login: async (email, password) => {
    try {
      const requestData = { email, password };
      logInfo('login.request', { email });
      
      const response = await api.post('/Auth/Login', requestData);
      logInfo('login.response', { status: response.status, hasToken: !!response.data?.token });
      
      // Token'ı kaydet (varsa)
      if (response.data && response.data.token) {
        setAccessToken(response.data.token);
        
        // Email admin@test.com ise admin rolü ata, diğer durumlarda user rolü ata
        // NOT: Bu geçici bir çözüm, gerçek projede rol bilgisi backend'den gelmeli
        if (email === 'elvincode1517@gmail.com') {
          setUserRole(ROLES.ADMIN);
        } else {
          setUserRole(ROLES.USER);
        }
        
        return response.data;
      } else {
        logError('login', { error: 'Yanıtta token yok' });
        throw new Error('Giriş başarısız: Yanıtta token yok');
      }
    } catch (error) {
      logError('login', error);
      let errorMessage = 'Giriş yapılırken bir hata oluştu';
      
      if (error.response?.status === 400) {
        errorMessage = 'Geçersiz kullanıcı adı veya şifre';
      } else if (error.response?.status === 404) {
        errorMessage = 'Kullanıcı bulunamadı';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      throw new Error(errorMessage);
    }
  },
  
  // Kullanıcı çıkışı
  logout: async () => {
    try {
      logInfo('logout.request', {});
      
      await api.post('/Auth/Logout');
      logInfo('logout.response', { success: true });
    } catch (error) {
      logError('logout', error);
    } finally {
      // Her durumda token ve rol bilgisini sil
      setAccessToken(null);
      setUserRole(null);
    }
  },

  // Mevcut kullanıcı bilgilerini al
  getCurrentUser: async () => {
    try {
      logInfo('getCurrentUser.request', {});
      
      const response = await api.post('/Profile/GetUserData');
      logInfo('getCurrentUser.response', { status: response.status });
      
      return {
        ...response.data,
        role: getUserRole() // Rol bilgisini ekle
      };
    } catch (error) {
      logError('getCurrentUser', error);
      
      const errorMessage = error.response?.data?.message || 'Kullanıcı bilgileri alınamadı';
      throw new Error(errorMessage);
    }
  },
  
  // Kullanıcı kaydı
  register: async (userData) => {
    try {
      const requestData = {
        createAppUserDto: {
          name: userData.name,
          email: userData.email,
          phoneNumber: userData.phoneNumber,
          password: userData.password
        }
      };
      
      logInfo('register.request', { email: userData.email });
      
      const response = await api.post('/Users/register', requestData);
      logInfo('register.response', { status: response.status });
      
      return response.data;
    } catch (error) {
      logError('register', error);
      
      let errorMessage = 'Kayıt olurken bir hata oluştu';
      if (error.response?.status === 400) {
        errorMessage = 'Geçersiz kullanıcı bilgileri';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  // Şifre sıfırlama isteği
  resetPassword: async (email) => {
    try {
      logInfo('resetPassword.request', { email });
      
      const response = await api.post('/Auth/reset-password', { email });
      logInfo('resetPassword.response', { status: response.status });
      
      return response.data;
    } catch (error) {
      logError('resetPassword', error);
      
      const errorMessage = error.response?.data?.message || 'Şifre sıfırlama işlemi başarısız oldu';
      throw new Error(errorMessage);
    }
  },

  // Token doğrulama
  confirmResetToken: async (token, userId) => {
    try {
      const requestData = {
        resetToken: token,
        userId: userId
      };
      
      logInfo('confirmResetToken.request', { userId });
      
      const response = await api.post('/Auth/confirm-reset-token', requestData);
      logInfo('confirmResetToken.response', { status: response.status });
      
      return response.data;
    } catch (error) {
      logError('confirmResetToken', error);
      
      const errorMessage = error.response?.data?.message || 'Şifre güncelleme işlemi başarısız oldu';
      throw new Error(errorMessage);
    }
  },

  // Şifre güncelleme
  updatePassword: async (userId, resetToken, password, passwordConfirm) => {
    try {
      const requestData = {
        userId,
        resetToken,
        password,
        passwordConfirm
      };
      
      logInfo('updatePassword.request', { userId });
      
      const response = await api.post('/Users/update-password', requestData);
      logInfo('updatePassword.response', { status: response.status });
      
      return response.data;
    } catch (error) {
      logError('updatePassword', error);
      
      const errorMessage = error.response?.data?.message || 'Şifre güncelleme işlemi başarısız oldu';
      throw new Error(errorMessage);
    }
  },
  
  // Kimlik doğrulaması kontrolü
  isAuthenticated: () => {
    return !!getAccessToken();
  },
  
  // Admin rolüne sahip mi kontrolü
  isAdmin: () => {
    return getUserRole() === ROLES.ADMIN;
  },
  
  // Kullanıcı rol bilgisini al
  getUserRole: () => {
    return getUserRole();
  }
};

// Rolleri dışa aktar
export { ROLES };
export default authService; 