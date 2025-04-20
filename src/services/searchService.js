import apiClient from './axiosConfig';
import { API_URL } from '../config';

const API_ENDPOINT = `${API_URL}/search`;

const searchService = {
  // Genel arama yapma
  async search(query, params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINT, { 
        params: { 
          q: query,
          ...params 
        } 
      });
      return response.data;
    } catch (error) {
      console.error('Arama yapılırken hata:', error);
      throw error;
    }
  },
  
  // İlanlarda arama yapma
  async searchAds(query, params = {}) {
    try {
      const response = await apiClient.get(`${API_ENDPOINT}/ads`, { 
        params: { 
          q: query,
          ...params 
        } 
      });
      return response.data;
    } catch (error) {
      console.error('İlan araması yapılırken hata:', error);
      throw error;
    }
  },
  
  // Kategorilerde arama yapma
  async searchCategories(query, params = {}) {
    try {
      const response = await apiClient.get(`${API_ENDPOINT}/categories`, { 
        params: { 
          q: query,
          ...params 
        } 
      });
      return response.data;
    } catch (error) {
      console.error('Kategori araması yapılırken hata:', error);
      throw error;
    }
  },
  
  // Kullanıcılarda arama yapma
  async searchUsers(query, params = {}) {
    try {
      const response = await apiClient.get(`${API_ENDPOINT}/users`, { 
        params: { 
          q: query,
          ...params 
        } 
      });
      return response.data;
    } catch (error) {
      console.error('Kullanıcı araması yapılırken hata:', error);
      throw error;
    }
  },
  
  // Gelişmiş arama yapma (filtreleme ve sıralama seçenekleriyle)
  async advancedSearch(searchParams) {
    try {
      const response = await apiClient.post(`${API_ENDPOINT}/advanced`, searchParams);
      return response.data;
    } catch (error) {
      console.error('Gelişmiş arama yapılırken hata:', error);
      throw error;
    }
  },
  
  // Arama önerilerini getir
  async getSearchSuggestions(query) {
    try {
      const response = await apiClient.get(`${API_ENDPOINT}/suggestions`, { 
        params: { q: query } 
      });
      return response.data;
    } catch (error) {
      console.error('Arama önerileri alınırken hata:', error);
      throw error;
    }
  },
  
  // Popüler aramaları getir
  async getPopularSearches() {
    try {
      const response = await apiClient.get(`${API_ENDPOINT}/popular`);
      return response.data;
    } catch (error) {
      console.error('Popüler aramalar alınırken hata:', error);
      throw error;
    }
  },
  
  // Kullanıcının arama geçmişini getir
  async getSearchHistory() {
    try {
      const response = await apiClient.get(`${API_ENDPOINT}/history`);
      return response.data;
    } catch (error) {
      console.error('Arama geçmişi alınırken hata:', error);
      throw error;
    }
  },
  
  // Arama geçmişini temizle
  async clearSearchHistory() {
    try {
      const response = await apiClient.delete(`${API_ENDPOINT}/history`);
      return response.data;
    } catch (error) {
      console.error('Arama geçmişi temizlenirken hata:', error);
      throw error;
    }
  }
};

export default searchService; 