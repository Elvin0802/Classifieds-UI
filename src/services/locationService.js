import apiClient from './axiosConfig';
import { API_URL } from '../config';

const LOCATIONS_URL = `${API_URL}/Locations`;

const locationService = {
  /**
   * Tüm lokasyonları getirir
   * @param {Object} params - Sayfalama parametreleri
   * @returns {Promise<Object>} Lokasyon listesi sonucu
   * @example
   * // Dönen veri formatı
   * {
   *   isSucceeded: true,
   *   message: "string",
   *   isFailed: false,
   *   data: {
   *     items: [ ... lokasyon nesneleri ... ],
   *     pageNumber: 0,
   *     pageSize: 0,
   *     totalCount: 0,
   *     totalPages: 0
   *   }
   * }
   */
  getAll: async (params = {}) => {
    try {
      const response = await apiClient.get(`${LOCATIONS_URL}/GetAll?CacheKey=AAAAAA&CacheTime=2025-05-24T09%3A31%3A09.627Z`, { params });
      return response.data;
    } catch (error) {
      console.error("Lokasyonlar alınırken hata:", error);
      throw error;
    }
  },

  /**
   * Lokasyon detayını ID'ye göre getirir
   * @param {string} id - Lokasyon ID'si
   * @returns {Promise<Object>} Lokasyon detayı sonucu
   * @example
   * // Dönen veri formatı
   * {
   *   isSucceeded: true,
   *   message: "string",
   *   isFailed: false,
   *   data: {
   *     item: {
   *       id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
   *       createdAt: "2025-04-18T18:50:17.335Z",
   *       updatedAt: "2025-04-18T18:50:17.335Z",
   *       city: "string",
   *       country: "string"
   *     }
   *   }
   * }
   */
  getById: async (id) => {
    try {
      const response = await apiClient.get(`${LOCATIONS_URL}/GetById`, { 
        params: { Id: id } 
      });
      return response.data;
    } catch (error) {
      console.error("Lokasyon detayı alınırken hata:", error);
      throw error;
    }
  },

  /**
   * Yeni lokasyon oluşturur
   * @param {Object} locationData - Lokasyon verileri {city, country}
   * @returns {Promise<Object>} Oluşturma sonucu
   * @example
   * // İstek veri formatı
   * {
   *   city: "string",
   *   country: "string"
   * }
   * 
   * // Dönen veri formatı
   * {
   *   isSucceeded: true,
   *   message: "string",
   *   isFailed: false
   * }
   */
  create: async (locationData) => {
    try {
      const response = await apiClient.post(`${LOCATIONS_URL}/Create`, locationData);
      return response.data;
    } catch (error) {
      console.error("Lokasyon oluşturulurken hata:", error);
      throw error;
    }
  },

  /**
   * Lokasyon siler
   * @param {string} id - Silinecek lokasyon ID'si
   * @returns {Promise<Object>} Silme sonucu
   * @example
   * // İstek veri formatı
   * {
   *   id: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
   * }
   * 
   * // Dönen veri formatı
   * {
   *   isSucceeded: true,
   *   message: "string",
   *   isFailed: false
   * }
   */
  delete: async (id) => {
    try {
      const response = await apiClient.post(`${LOCATIONS_URL}/Delete`, { id });
      return response.data;
    } catch (error) {
      console.error("Lokasyon silinirken hata:", error);
      throw error;
    }
  }
};

export default locationService; 