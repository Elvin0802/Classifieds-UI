import apiClient from './axiosConfig';
import authStorage from './authStorage';

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
      
      // Token'ı localStorage'a kaydet, diğer değerler AuthContext tarafından ayarlanacak
      if (response.data && response.data.token) {
        localStorage.setItem('accessToken', response.data.token);
        // localStorage isLogin, isAdmin ve userId değerleri AuthContext tarafından ayarlanacak
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
      const response = await apiClient.post(`${AUTH_URL}/RefreshTokenLogin`, {}, {
        withCredentials: true // Cookie'leri göndermek için
      });
      
      // Token'ı localStorage'a kaydet
      if (response.data && response.data.token) {
        localStorage.setItem('accessToken', response.data.token);
        
        // authStorage servisini kullanarak kullanıcı bilgilerini kaydet
        authStorage.setIsLogin(true);
        
        // JWT token decode işlemi
        try {
          const tokenData = JSON.parse(atob(response.data.token.split('.')[1]));
          
          // Admin rolünü kontrol et ve kaydet
          const isAdmin = tokenData.role && (
            Array.isArray(tokenData.role) 
              ? tokenData.role.includes('Admin') 
              : tokenData.role === 'Admin'
          );
          authStorage.setIsAdmin(isAdmin);
          
          // Kullanıcı ID'sini kaydet
          const userId = tokenData.sub || tokenData.userId || tokenData.nameid;
          if (userId) {
            authStorage.setUserId(userId);
          }
          
          console.log('Token yenilendi ve bilgiler decode edildi:', { isAdmin, userId });
        } catch (decodeError) {
          console.error('Token decode hatası:', decodeError);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Refresh token ile giriş yapılırken hata:', error);
      // Hata olsa bile token'ı silme ve giriş durumunu koruma
      // LocalStorage temizleme işlemini yapma
      return false;
    }
  },
  
  /**
   * Otomatik giriş kontrolü yapar
   * @returns {Promise<boolean>} Giriş başarılı mı?
   */
  autoLogin: async () => {
    // Önce localStorage'da token var mı kontrol et
    const token = localStorage.getItem('accessToken');
    const isLogin = localStorage.getItem('isLogin') === 'true';
    
    // Eğer token varsa, başka işlem yapma, giriş yapmış kabul et
    if (token) {
      console.log('Token bulundu, giriş yapmış kabul ediliyor');
      
      // LocalStorage ile uyumlu hale getir
      if (!isLogin) {
        authStorage.setIsLogin(true);
      }
      
      return true;
    }
    
    console.log('Token bulunamadı, refresh token ile giriş deneniyor');
    
    // Token yoksa refresh token ile giriş dene
    return await authService.refreshTokenLogin();
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
      
      // localStorage'dan token'ı temizle
      localStorage.removeItem('accessToken');
      
      // authStorage servisini kullanarak tüm auth verilerini temizle
      authStorage.clear();
      
      return response.data;
    } catch (error) {
      console.error('Çıkış yapılırken hata:', error);
      // Hata durumunda da token'ı temizle
      localStorage.removeItem('accessToken');
      authStorage.clear();
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
    // authStorage servisini kullanarak kontrol et
    return authStorage.getIsLogin();
  }
};

export default authService; 