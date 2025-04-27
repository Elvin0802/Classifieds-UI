import apiClient, { setAccessToken, getAccessToken, clearAccessToken } from './axiosConfig';
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
      
      console.log('Auth Service Login Yanıtı:', response.data);
      
      // API response türünü analiz et
      let token = null;
      
      // Farklı yanıt formatlarını kontrol et
      if (response.data && response.data.token) {
        // 1. Format: Direk token alanı
        token = response.data.token;
        console.log('Token direk yanıtta bulundu (token alanı)');
      } 
      else if (response.data && typeof response.data.data === 'string' && response.data.isSucceeded) {
        // 2. Format: data alanı direkt string olarak token içeriyor
        token = response.data.data;
        console.log('Token data alanında string olarak bulundu');
      }
      else if (response.data && response.data.isSucceeded && response.data.data && response.data.data.token) {
        // 3. Format: API Wrapper: data.token
        token = response.data.data.token;
        console.log('Token data.token formatında bulundu');
      }
      else if (response.data && response.data.isSucceeded && response.data.data && response.data.data.item && response.data.data.item.token) {
        // 4. Format: API Wrapper: data.item.token
        token = response.data.data.item.token;
        console.log('Token data.item.token formatında bulundu');
      }
      
      // Token varsa belleğe kaydet
      if (token) {
        console.log('Token kaydediliyor:', token.substring(0, 20) + '...');
        setAccessToken(token);
        authStorage.setIsLogin(true);
      } else {
        console.log('Token bulunamadı!');
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
   */
  refreshTokenLogin: async () => {
    // Kullanıcı login durumunu kontrol et
    const isLoginActive = authStorage.getIsLogin();
    
    // Kullanıcı login değilse, token yenileme işlemini atla
    if (!isLoginActive) {
      console.log('refreshTokenLogin: Kullanıcı giriş yapmamış, atlanıyor');
      return false;
    }
    
    try {
      // API'ye refreshToken isteği gönder
      console.log('refreshTokenLogin: API isteği gönderiliyor...');
      
      const response = await apiClient.post(`${AUTH_URL}/RefreshTokenLogin`, {}, {
        withCredentials: true // Cookie'leri göndermek için
      });
      
      // API yanıtını kontrol et 
      if (!response.data || !response.data.isSucceeded) {
        console.log('Refresh token başarısız: API başarısız yanıt');
        // Token ve login durumunu temizle
        clearAccessToken();
        authStorage.clear();
        return false;
      }
      
      console.log('Refresh token yanıtı başarılı');
      
      // Token'ı yanıttan çıkar (token API'de data alanında string olarak geliyor)
      const token = typeof response.data.data === 'string' ? response.data.data : null;
      
      if (!token) {
        console.log('Refresh token yanıtında token bulunamadı');
        // Token bulunamadı, login durumunu da temizle
        clearAccessToken();
        authStorage.clear();
        return false;
      }
      
      // Token'ı kaydet (localStorage'a da kaydedilecek)
      setAccessToken(token);
      // Login durumunu aktif olarak işaretle
      authStorage.setIsLogin(true);
      
      console.log('Refresh token başarılı, yeni token kaydedildi');
      
      return true;
    } catch (error) {
      console.error('Refresh token hatası:', error);
      
      // 401 hatası alındığında oturum durumunu temizle
      if (error.response && error.response.status === 401) {
        console.log('401 Yetkisiz hatası - Oturum bilgileri temizleniyor');
        clearAccessToken();
        authStorage.clear();
      } else {
        // Diğer hatalarda sadece token temizle
        clearAccessToken();
      }
      
      return false;
    }
  },
  
  /**
   * Otomatik giriş kontrolü yapar
   * @returns {Promise<boolean>} Giriş başarılı mı?
   */
  autoLogin: async () => {
    // Mevcut token var mı kontrol et
    const currentToken = getAccessToken();
    
    // Bellekte token varsa, oturum açık kabul et
    if (currentToken) {
      console.log('Bellekte token bulundu, oturum açık');
      return true;
    }
    
    // LocalStorage'daki login durumunu kontrol et
    const isLoginActive = authStorage.getIsLogin();
    
    // Login aktif değilse refresh token deneme
    if (!isLoginActive) {
      console.log('Kullanıcı giriş yapmış, refresh token işlemi atlanıyor');
      return false;
    }
    
    // Token yoksa VE login aktifse refresh token dene
    console.log('Bellekte token bulunamadı ancak login aktif, refresh token deneniyor');
    return await authService.refreshTokenLogin();
  },
  
  /**
   * Kullanıcı çıkışı yapar
   * @returns {Promise<Object>} Çıkış sonucu
   */
  logout: async () => {
    try {
      // API'ye logout isteği gönder
      const response = await apiClient.post(`${AUTH_URL}/Logout`, null, {
        withCredentials: true
      });
      
      // Her durumda state'leri ve token'ı temizle
      clearAccessToken();
      authStorage.clear();
      
      return response.data;
    } catch (error) {
      console.error('Çıkış yapılırken hata:', error);
      
      // Hata olsa bile token ve state'leri temizle
      clearAccessToken();
      authStorage.clear();
      
      // Hata durumunda da başarılı dön, çünkü client tarafında temizledik
      return { isSucceeded: true, message: 'Çıkış yapıldı (yerel)' };
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
    // Token ve login durumunu kontrol et
    return !!getAccessToken() && authStorage.getIsLogin();
  }
};

export default authService; 