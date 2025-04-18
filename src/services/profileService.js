import axios from 'axios';
import { API_URL } from '../config';

const PROFILE_URL = `${API_URL}/Profile`;

const profileService = {
  /**
   * Kullanıcı bilgilerini getirir
   * @returns {Promise<Object>} Kullanıcı bilgileri
   * @example
   * // Dönen veri formatı
   * {
   *   "isSucceeded": true,
   *   "message": "string",
   *   "isFailed": false,
   *   "data": {
   *     "item": {
   *       "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
   *       "createdAt": "2025-04-18T19:40:49.102Z",
   *       "updatedAt": "2025-04-18T19:40:49.102Z",
   *       "name": "string",
   *       "email": "string",
   *       "phoneNumber": "string",
   *       "isAdmin": true
   *     }
   *   }
   * }
   */
  getUserData: async () => {
    try {
      const response = await axios.post(`${PROFILE_URL}/GetUserData`);
      return response.data;
    } catch (error) {
      console.error('Kullanıcı bilgileri alınırken hata:', error);
      throw error;
    }
  },

  /**
   * Kullanıcının aktif ilanlarını getirir
   * @param {Object} params - Sayfalama parametreleri
   * @returns {Promise<Object>} Aktif ilanlar listesi
   * @example
   * // Dönen veri formatı
   * {
   *   "isSucceeded": true,
   *   "message": "string",
   *   "isFailed": false,
   *   "data": {
   *     "items": [
   *       {
   *         "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
   *         "title": "string",
   *         "price": 0,
   *         "isNew": true,
   *         "isSelected": true,
   *         "isFeatured": true,
   *         "locationCityName": "string",
   *         "mainImageUrl": "string",
   *         "updatedAt": "2025-04-18T19:41:30.641Z"
   *       }
   *     ],
   *     "pageNumber": 0,
   *     "pageSize": 0,
   *     "totalCount": 0,
   *     "totalPages": 0
   *   }
   * }
   */
  getActiveAds: async (params = {}) => {
    try {
      const response = await axios.get(`${PROFILE_URL}/GetActiveAds`, { params });
      return response.data;
    } catch (error) {
      console.error('Aktif ilanlar alınırken hata:', error);
      throw error;
    }
  },

  /**
   * Kullanıcının bekleyen ilanlarını getirir
   * @param {Object} params - Sayfalama parametreleri
   * @returns {Promise<Object>} Bekleyen ilanlar listesi
   * @example
   * // Dönen veri formatı
   * {
   *   "isSucceeded": true,
   *   "message": "string",
   *   "isFailed": false,
   *   "data": {
   *     "items": [
   *       {
   *         "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
   *         "title": "string",
   *         "price": 0,
   *         "isNew": true,
   *         "isSelected": true,
   *         "isFeatured": true,
   *         "locationCityName": "string",
   *         "mainImageUrl": "string",
   *         "updatedAt": "2025-04-18T19:41:56.114Z"
   *       }
   *     ],
   *     "pageNumber": 0,
   *     "pageSize": 0,
   *     "totalCount": 0,
   *     "totalPages": 0
   *   }
   * }
   */
  getPendingAds: async (params = {}) => {
    try {
      const response = await axios.get(`${PROFILE_URL}/GetPendingAds`, { params });
      return response.data;
    } catch (error) {
      console.error('Bekleyen ilanlar alınırken hata:', error);
      throw error;
    }
  },

  /**
   * Kullanıcının süresi dolmuş ilanlarını getirir
   * @param {Object} params - Sayfalama parametreleri
   * @returns {Promise<Object>} Süresi dolmuş ilanlar listesi
   * @example
   * // Dönen veri formatı
   * {
   *   "isSucceeded": true,
   *   "message": "string",
   *   "isFailed": false,
   *   "data": {
   *     "items": [
   *       {
   *         "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
   *         "title": "string",
   *         "price": 0,
   *         "isNew": true,
   *         "isSelected": true,
   *         "isFeatured": true,
   *         "locationCityName": "string",
   *         "mainImageUrl": "string",
   *         "updatedAt": "2025-04-18T19:42:21.284Z"
   *       }
   *     ],
   *     "pageNumber": 0,
   *     "pageSize": 0,
   *     "totalCount": 0,
   *     "totalPages": 0
   *   }
   * }
   */
  getExpiredAds: async (params = {}) => {
    try {
      const response = await axios.get(`${PROFILE_URL}/GetExpiredAds`, { params });
      return response.data;
    } catch (error) {
      console.error('Süresi dolmuş ilanlar alınırken hata:', error);
      throw error;
    }
  },

  /**
   * Kullanıcının reddedilmiş ilanlarını getirir
   * @param {Object} params - Sayfalama parametreleri
   * @returns {Promise<Object>} Reddedilmiş ilanlar listesi
   * @example
   * // Dönen veri formatı
   * {
   *   "isSucceeded": true,
   *   "message": "string",
   *   "isFailed": false,
   *   "data": {
   *     "items": [
   *       {
   *         "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
   *         "title": "string",
   *         "price": 0,
   *         "isNew": true,
   *         "isSelected": true,
   *         "isFeatured": true,
   *         "locationCityName": "string",
   *         "mainImageUrl": "string",
   *         "updatedAt": "2025-04-18T19:42:37.288Z"
   *       }
   *     ],
   *     "pageNumber": 0,
   *     "pageSize": 0,
   *     "totalCount": 0,
   *     "totalPages": 0
   *   }
   * }
   */
  getRejectedAds: async (params = {}) => {
    try {
      const response = await axios.get(`${PROFILE_URL}/GetRejectedAds`, { params });
      return response.data;
    } catch (error) {
      console.error('Reddedilmiş ilanlar alınırken hata:', error);
      throw error;
    }
  },

  /**
   * Kullanıcının öne çıkarılmış ilanlarını getirir
   * @param {Object} params - Sayfalama parametreleri
   * @returns {Promise<Object>} Öne çıkarılmış ilanlar listesi
   * @example
   * // Dönen veri formatı
   * {
   *   "isSucceeded": true,
   *   "message": "string",
   *   "isFailed": false,
   *   "data": {
   *     "items": [
   *       {
   *         "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
   *         "title": "string",
   *         "price": 0,
   *         "isNew": true,
   *         "isSelected": true,
   *         "isFeatured": true,
   *         "locationCityName": "string",
   *         "mainImageUrl": "string",
   *         "updatedAt": "2025-04-18T19:43:42.621Z"
   *       }
   *     ],
   *     "pageNumber": 0,
   *     "pageSize": 0,
   *     "totalCount": 0,
   *     "totalPages": 0
   *   }
   * }
   */
  getSelectedAds: async (params = {}) => {
    try {
      const response = await axios.get(`${PROFILE_URL}/GetSelectedAds`, { params });
      return response.data;
    } catch (error) {
      console.error('Öne çıkarılmış ilanlar alınırken hata:', error);
      throw error;
    }
  }
};

export default profileService; 