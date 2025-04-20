import apiClient from './axiosConfig';
import { API_URL } from '../config';

const REPORTS_URL = `${API_URL}/reports`;

/**
 * Rapor servisi - İlan raporlama işlemleri için API istekleri
 */
const reportService = {
  /**
   * Bir ilanı rapor et
   * @param {Object} reportData - Rapor verisi
   * @param {string} reportData.adId - Rapor edilen ilanın ID'si
   * @param {string} reportData.reason - Rapor nedeni (INAPPROPRIATE_CONTENT, FAKE_AD, SPAM, WRONG_CATEGORY, SCAM, OTHER)
   * @param {string} reportData.description - Rapor açıklaması
   * @returns {Promise} - API yanıtı
   */
  createReport: async (reportData) => {
    try {
      const response = await apiClient.post(`${REPORTS_URL}/CreateReport`, reportData);
      return response.data;
    } catch (error) {
      console.error('İlan raporlanırken hata:', error);
      throw error;
    }
  },

  /**
   * Tüm raporları getir (admin için)
   * @param {string} status - Filtrelenecek durum (opsiyonel)
   * @returns {Promise} - API yanıtı
   */
  getAllReports: async (status = null) => {
    try {
      let params = {};
      if (status) {
        params.status = status;
      }
      
      const response = await apiClient.get(`${REPORTS_URL}/GetAllReports`, { params });
      return response.data;
    } catch (error) {
      console.error('Raporlar getirilirken hata:', error);
      throw error;
    }
  },

  /**
   * Bir raporu ID'sine göre getir
   * @param {string} reportId - Rapor ID'si
   * @returns {Promise} - API yanıtı
   */
  getReportById: async (reportId) => {
    try {
      const response = await apiClient.get(`${REPORTS_URL}/GetReportById/${reportId}`);
      return response.data;
    } catch (error) {
      console.error(`${reportId} ID'li rapor getirilirken hata:`, error);
      throw error;
    }
  },

  /**
   * Bir ilanın raporlarını getir
   * @param {string} adId - İlan ID'si
   * @returns {Promise} - API yanıtı
   */
  getReportsByAdId: async (adId) => {
    try {
      const response = await apiClient.get(`${REPORTS_URL}/GetReportsByAdId/${adId}`);
      return response.data;
    } catch (error) {
      console.error(`${adId} ID'li ilanın raporları getirilirken hata:`, error);
      throw error;
    }
  },

  /**
   * Rapor durumunu güncelle
   * @param {Object} reportData - Rapor güncellemesi için gerekli veriler
   * @returns {Promise} - API yanıtı
   */
  updateReportStatus: async (reportData) => {
    try {
      const response = await apiClient.post(`${REPORTS_URL}/UpdateReportStatus`, reportData);
      return response.data;
    } catch (error) {
      console.error(`Rapor durumu güncellenirken hata:`, error);
      throw error;
    }
  },

  /**
   * Bir raporu sil (Admin için)
   * @param {string} reportId - Silinecek raporun ID'si
   * @returns {Promise} - API yanıtı
   */
  deleteReport: async (reportId) => {
    try {
      const response = await apiClient.delete(`${REPORTS_URL}/${reportId}`);
      return response.data;
    } catch (error) {
      console.error(`${reportId} ID'li rapor silinirken hata:`, error);
      throw error;
    }
  },

  /**
   * Rapor istatistiklerini getir (Admin için)
   * @returns {Promise} - API yanıtı
   */
  getReportStats: async () => {
    try {
      const response = await apiClient.get(`${REPORTS_URL}/GetReportStats`);
      return response.data;
    } catch (error) {
      console.error('Rapor istatistikleri getirilirken hata:', error);
      throw error;
    }
  }
};

export default reportService; 