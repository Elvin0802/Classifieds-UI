import axios from 'axios';
import { API_URL } from '../config';

const CATEGORIES_URL = `${API_URL}/Categories`;

const categoryService = {
  /**
   * Yeni bir kategori oluşturur
   * @param {Object} categoryData - Kategori verileri
   * @returns {Promise<Object>} Oluşturma sonucu
   * @example
   * // İstek veri formatı
   * {
   *   "name": "string"
   * }
   * 
   * // Dönen veri formatı
   * {
   *   "isSucceeded": true,
   *   "message": "string",
   *   "isFailed": false
   * }
   */
  createCategory: async (categoryData) => {
    try {
      const response = await axios.post(`${CATEGORIES_URL}/create/category`, categoryData);
      return response.data;
    } catch (error) {
      console.error('Kategori oluşturulurken hata:', error);
      throw error;
    }
  },

  /**
   * Tüm kategorileri getirir
   * @param {Object} params - Sayfalama parametreleri (PageNumber, PageSize)
   * @returns {Promise<Object>} Kategori listesi sonucu
   * @example
   * // Dönen veri formatı
   * {
   *   "isSucceeded": true,
   *   "message": "string",
   *   "isFailed": false,
   *   "data": {
   *     "items": [ ... kategori nesneleri ... ],
   *     "pageNumber": 0,
   *     "pageSize": 0,
   *     "totalCount": 0,
   *     "totalPages": 0
   *   }
   * }
   */
  getAllCategories: async (params = {}) => {
    try {
      const response = await axios.get(`${CATEGORIES_URL}/all/category`, { params });
      return response.data;
    } catch (error) {
      console.error('Kategoriler alınırken hata:', error);
      throw error;
    }
  },

  /**
   * ID'ye göre kategori detayını getirir
   * @param {string} id - Kategori ID
   * @returns {Promise<Object>} Kategori detayı
   * @example
   * // Dönen veri formatı
   * {
   *   "isSucceeded": true,
   *   "message": "string",
   *   "isFailed": false,
   *   "data": {
   *     "item": { ... kategori nesnesi ... }
   *   }
   * }
   */
  getCategoryById: async (id) => {
    try {
      const response = await axios.get(`${CATEGORIES_URL}/byId/category`, {
        params: { Id: id }
      });
      return response.data;
    } catch (error) {
      console.error('Kategori detayı alınırken hata:', error);
      throw error;
    }
  },

  /**
   * Yeni bir ana kategori oluşturur
   * @param {Object} mainCategoryData - Ana kategori verileri
   * @returns {Promise<Object>} Oluşturma sonucu
   * @example
   * // İstek veri formatı
   * {
   *   "name": "string",
   *   "parentCategoryId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
   * }
   * 
   * // Dönen veri formatı
   * {
   *   "isSucceeded": true,
   *   "message": "string",
   *   "isFailed": false
   * }
   */
  createMainCategory: async (mainCategoryData) => {
    try {
      const response = await axios.post(`${CATEGORIES_URL}/create/main-category`, mainCategoryData);
      return response.data;
    } catch (error) {
      console.error('Ana kategori oluşturulurken hata:', error);
      throw error;
    }
  },

  /**
   * Tüm ana kategorileri getirir
   * @param {Object} params - Sayfalama parametreleri (PageNumber, PageSize)
   * @returns {Promise<Object>} Ana kategori listesi sonucu
   * @example
   * // Dönen veri formatı
   * {
   *   "isSucceeded": true,
   *   "message": "string",
   *   "isFailed": false,
   *   "data": {
   *     "items": [ ... ana kategori nesneleri ... ],
   *     "pageNumber": 0,
   *     "pageSize": 0,
   *     "totalCount": 0,
   *     "totalPages": 0
   *   }
   * }
   */
  getAllMainCategories: async (params = {}) => {
    try {
      const response = await axios.get(`${CATEGORIES_URL}/all/main-category`, { params });
      return response.data;
    } catch (error) {
      console.error('Ana kategoriler alınırken hata:', error);
      throw error;
    }
  },

  /**
   * Ana kategori detayını ID'ye göre getirir
   * @param {string} id - Ana kategori ID'si
   * @returns {Promise<Object>} Ana kategori detayı
   * @example
   * // Dönen veri formatı
   * {
   *   "isSucceeded": true,
   *   "message": "string",
   *   "isFailed": false,
   *   "data": {
   *     "item": { ... ana kategori nesnesi ... }
   *   }
   * }
   */
  getMainCategoryById: async (id) => {
    try {
      const response = await axios.get(`${CATEGORIES_URL}/byId/main-category`, { 
        params: { Id: id } 
      });
      return response.data;
    } catch (error) {
      console.error('Ana kategori detayı alınırken hata:', error);
      throw error;
    }
  },

  /**
   * Yeni bir alt kategori oluşturur
   * @param {Object} subCategoryData - Alt kategori verileri
   * @returns {Promise<Object>} Oluşturma sonucu
   * @example
   * // İstek veri formatı
   * {
   *   "name": "string",
   *   "isRequired": true,
   *   "type": 0,
   *   "mainCategoryId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
   *   "options": [
   *     "string"
   *   ]
   * }
   * 
   * // Dönen veri formatı
   * {
   *   "isSucceeded": true,
   *   "message": "string",
   *   "isFailed": false
   * }
   */
  createSubCategory: async (subCategoryData) => {
    try {
      const response = await axios.post(`${CATEGORIES_URL}/create/sub-category`, subCategoryData);
      return response.data;
    } catch (error) {
      console.error('Alt kategori oluşturulurken hata:', error);
      throw error;
    }
  },

  /**
   * Tüm alt kategorileri getirir
   * @param {Object} params - Sayfalama parametreleri (PageNumber, PageSize)
   * @returns {Promise<Object>} Alt kategori listesi sonucu
   * @example
   * // Dönen veri formatı
   * {
   *   "isSucceeded": true,
   *   "message": "string",
   *   "isFailed": false,
   *   "data": {
   *     "items": [ ... alt kategori nesneleri ... ],
   *     "pageNumber": 0,
   *     "pageSize": 0,
   *     "totalCount": 0,
   *     "totalPages": 0
   *   }
   * }
   */
  getAllSubCategories: async (params = {}) => {
    try {
      const response = await axios.get(`${CATEGORIES_URL}/all/sub-category`, { params });
      return response.data;
    } catch (error) {
      console.error('Alt kategoriler alınırken hata:', error);
      throw error;
    }
  },

  /**
   * Alt kategori detayını ID'ye göre getirir
   * @param {string} id - Alt kategori ID'si
   * @returns {Promise<Object>} Alt kategori detayı
   * @example
   * // Dönen veri formatı
   * {
   *   "isSucceeded": true,
   *   "message": "string",
   *   "isFailed": false,
   *   "data": {
   *     "item": { ... alt kategori nesnesi ... }
   *   }
   * }
   */
  getSubCategoryById: async (id) => {
    try {
      const response = await axios.get(`${CATEGORIES_URL}/byId/sub-category`, { 
        params: { Id: id } 
      });
      return response.data;
    } catch (error) {
      console.error('Alt kategori detayı alınırken hata:', error);
      throw error;
    }
  }
};

export default categoryService; 