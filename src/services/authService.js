import apiClient from './axiosConfig';

const AUTH_URL = `/Auth`;

const authService = {
  /**
   * Kullanıcı girişi yapar
   * @param {Object} credentials - Kullanıcı bilgileri (email, password)
   * @returns {Promise<Object>} Giriş sonucu
   * @example
   * // İstek veri formatı
   * {
   *   "email": "string",
   *   "password": "string"
   * }
   * 
   * // Başarılı yanıt: 200 OK
   * // Başarısız yanıt: 400, 404 veya 500
   */
  login: async (credentials) => {
    try {
      const response = await apiClient.post(`${AUTH_URL}/Login`, credentials);
      
      // Token değerini dönen veri üzerinde mevcut olarak işaretleyelim
      if (response.data && !response.data.isSucceeded) {
        response.data.isSucceeded = true;
      }
      
      return response.data;
    } catch (error) {
      console.error('Giriş yapılırken hata:', error);
      throw error;
    }
  },
  
  /**
   * Refresh token ile giriş yapar
   * @returns {Promise<boolean>} Giriş başarılı mı?
   * 
   * // Başarılı yanıt: 200 OK
   * // Başarısız yanıt: 400, 404 veya 500
   */
  refreshTokenLogin: async () => {
    try {
      const response = await apiClient.post(`${AUTH_URL}/RefreshTokenLogin`);
      return response.status === 200;
    } catch (error) {
      console.error('Refresh token ile giriş yapılırken hata:', error);
      throw error;
    }
  },
  
  /**
   * Kullanıcı çıkışı yapar
   * @returns {Promise<Object>} Çıkış sonucu
   * 
   * // Başarılı yanıt: 200 OK
   * // Başarısız yanıt: 400, 401, 404 veya 500
   */
  logout: async () => {
    try {
      const response = await apiClient.post(`${AUTH_URL}/Logout`);
      
      // localStorage'dan accessToken'ı temizle
      localStorage.removeItem('accessToken');
      
      return response.data;
    } catch (error) {
      console.error('Çıkış yapılırken hata:', error);
      // Hata durumunda da token'ı temizle
      localStorage.removeItem('accessToken');
      throw error;
    }
  },
  
  /**
   * Şifre sıfırlama talebi gönderir
   * @param {Object} data - Şifre sıfırlama bilgileri
   * @returns {Promise<Object>} Sıfırlama talebi sonucu
   * @example
   * // İstek veri formatı
   * {
   *   "email": "string"
   * }
   */
  resetPassword: async (data) => {
    try {
      const response = await apiClient.post(`${AUTH_URL}/reset-password`, data);
      return response.data;
    } catch (error) {
      console.error('Şifre sıfırlama talebi gönderilirken hata:', error);
      throw error;
    }
  },
  
  /**
   * Şifre sıfırlama token'ını doğrular
   * @param {Object} data - Token doğrulama bilgileri
   * @returns {Promise<Object>} Doğrulama sonucu
   * @example
   * // İstek veri formatı
   * {
   *   "resetToken": "string",
   *   "userId": "string"
   * }
   */
  confirmResetToken: async (data) => {
    try {
      const response = await apiClient.post(`${AUTH_URL}/confirm-reset-token`, data);
      return response.data;
    } catch (error) {
      console.error('Şifre sıfırlama token\'ı doğrulanırken hata:', error);
      throw error;
    }
  },
  
  /**
   * Kullanıcının giriş yapmış olup olmadığını kontrol eder
   * @returns {boolean} Giriş durumu
   */
  isAuthenticated: () => {
    // localStorage'da token var mı kontrol et
    return !!localStorage.getItem('accessToken');
  }
};

export default authService; 