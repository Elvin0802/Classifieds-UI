import apiClient from './axiosConfig';
import { API_URL } from '../config';

const BLACKLIST_URL = `${API_URL}/Blacklist`;

const blacklistService = {
  // Kullanıcıyı kara listeye ekle
  blacklistUser: async (email, reason) => {
    const response = await apiClient.post(`${BLACKLIST_URL}/BlacklistUser`, { email, reason });
    return response.data;
  },

  // Kara listedeki kullanıcıları getir
  getBlacklistedUsers: async () => {
    const response = await apiClient.get(`${BLACKLIST_URL}/GetBlacklistedUsers`);
    return response.data;
  },

  // Kullanıcıyı kara listeden çıkar
  unblacklistUser: async (email) => {
    const response = await apiClient.post(`${BLACKLIST_URL}/UnblacklistUser`, { email });
    return response.data;
  }
};

export default blacklistService; 