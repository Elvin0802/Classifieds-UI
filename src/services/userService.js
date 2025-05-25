import apiClient from './axiosConfig';
import { API_URL } from '../config';

const USERS_URL = `${API_URL}/Users`;

const userService = {
  /**
   * Kullanıcı kaydı yapar
   * @param {Object} userData - Kayıt bilgileri
   * @returns {Promise<Object>} Kayıt sonucu
   * @example
   * // İstek veri formatı
   * {
   *   "createAppUserDto": {
   *     "name": "string",
   *     "email": "string",
   *     "phoneNumber": "string",
   *     "password": "string"
   *   }
   * }
   * 
   * // Dönen veri formatı
   * {
   *   "isSucceeded": true,
   *   "message": "string",
   *   "isFailed": false
   * }
   */
  register: async (userData) => {
    try {
      const payload = {
        createAppUserDto: userData
      };
      const response = await apiClient.post(`${USERS_URL}/register`, payload);
      return response.data;
    } catch (error) {
      console.error('Kayıt işlemi sırasında hata:', error);
      throw error;
    }
  },

  /**
   * Şifre güncelleme işlemi (şifre sıfırlama sonrası)
   * @param {Object} passwordData - Şifre güncelleme bilgileri
   * @returns {Promise<Object>} Güncelleme sonucu
   * @example
   * // İstek veri formatı
   * {
   *   "userId": "string",
   *   "resetToken": "string",
   *   "password": "string",
   *   "passwordConfirm": "string"
   * }
   * 
   * // Dönen veri formatı
   * {
   *   "isSucceeded": true,
   *   "message": "string",
   *   "isFailed": false
   * }
   */
  updatePassword: async (passwordData) => {
    try {
      const response = await apiClient.post(`${USERS_URL}/UpdatePassword`, passwordData);
      return response.data;
    } catch (error) {
      console.error('Şifre güncelleme sırasında hata:', error);
      throw error;
    }
  },

  /**
   * Şifre değiştirme işlemi (kullanıcı girişi yapılmışken)
   * @param {Object} passwordData - Şifre değiştirme bilgileri
   * @returns {Promise<Object>} Değiştirme sonucu
   * @example
   * // İstek veri formatı
   * {
   *   "oldPassword": "string",
   *   "newPassword": "string",
   *   "newPasswordConfirm": "string"
   * }
   * 
   * // Dönen veri formatı
   * {
   *   "isSucceeded": true,
   *   "message": "string",
   *   "isFailed": false
   * }
   */
  changePassword: async (passwordData) => {
    try {
      const { oldPassword, newPassword, newPasswordConfirm } = passwordData;
      const response = await apiClient.post(`${USERS_URL}/ChangePassword`, {
        oldPassword,
        newPassword,
        newPasswordConfirm
      });
      return response.data;
    } catch (error) {
      console.error('Şifre değiştirme sırasında hata:', error);
      throw error;
    }
  },

  /**
   * Email doğrulama kodunu kontrol eder
   * @param {Object} data - { email, code }
   * @returns {Promise<Object>} Sonuç
   */
  verifyEmail: async (data) => {
    try {
      const response = await apiClient.post(`${USERS_URL}/VerifyEmail`, data);
      return response.data;
    } catch (error) {
      console.error('Email doğrulama sırasında hata:', error);
      throw error;
    }
  },

  /**
   * Email doğrulama kodunu tekrar gönderir
   * @param {Object} data - { email }
   * @returns {Promise<Object>} Sonuç
   */
  resendVerification: async (data) => {
    try {
      const response = await apiClient.post(`${USERS_URL}/ResendVerification`, data);
      return response.data;
    } catch (error) {
      console.error('Doğrulama kodu tekrar gönderilemedi:', error);
      throw error;
    }
  }
};

export default userService; 