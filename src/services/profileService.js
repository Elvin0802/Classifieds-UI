import api from './api';

const logError = (methodName, error) => {
  console.error(`[ProfileService] ${methodName} hatası:`, {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
    stack: error.stack
  });
};

const logInfo = (methodName, data) => {
  if (process.env.NODE_ENV === 'development') {
    console.info(`[ProfileService] ${methodName}:`, data);
  }
};

const profileService = {
  getUserData: async () => {
    try {
      logInfo('getUserData.request', {});
      const response = await api.post('/Profile/GetUserData');
      logInfo('getUserData.response', response.data);
      return response.data;
    } catch (error) {
      logError('getUserData', error);
      throw new Error('Kullanıcı bilgileri alınamadı: ' + (error.response?.data?.message || error.message));
    }
  },
  
  changePassword: async (data) => {
    try {
      logInfo('changePassword.request', {
        userId: data.userId,
        hasOldPassword: !!data.oldPassword,
        hasNewPassword: !!data.newPassword
      });
      
      const response = await api.post('/Users/change-password', {
        userId: data.userId,
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
        newPasswordConfirm: data.confirmPassword
      });
      
      logInfo('changePassword.response', response.data);
      return response.data;
    } catch (error) {
      logError('changePassword', error);
      throw new Error('Şifre değiştirilemedi: ' + (error.response?.data?.message || error.message));
    }
  },
  
  getActiveAds: async () => {
    try {
      logInfo('getActiveAds.request', {});
      const response = await api.post('/Profile/GetActiveAds');
      logInfo('getActiveAds.response', { 
        totalCount: response.data.totalCount, 
        itemsCount: response.data.items?.length || 0 
      });
      return response.data;
    } catch (error) {
      logError('getActiveAds', error);
      throw new Error('Aktif ilanlar alınamadı: ' + (error.response?.data?.message || error.message));
    }
  },
  
  getPendingAds: async () => {
    try {
      logInfo('getPendingAds.request', {});
      const response = await api.post('/Profile/GetPendingAds');
      logInfo('getPendingAds.response', { 
        totalCount: response.data.totalCount, 
        itemsCount: response.data.items?.length || 0 
      });
      return response.data;
    } catch (error) {
      logError('getPendingAds', error);
      throw new Error('Bekleyen ilanlar alınamadı: ' + (error.response?.data?.message || error.message));
    }
  },
  
  getExpiredAds: async () => {
    try {
      logInfo('getExpiredAds.request', {});
      const response = await api.post('/Profile/GetExpiredAds');
      logInfo('getExpiredAds.response', { 
        totalCount: response.data.totalCount, 
        itemsCount: response.data.items?.length || 0 
      });
      return response.data;
    } catch (error) {
      logError('getExpiredAds', error);
      throw new Error('Süresi dolmuş ilanlar alınamadı: ' + (error.response?.data?.message || error.message));
    }
  },
  
  getRejectedAds: async () => {
    try {
      logInfo('getRejectedAds.request', {});
      const response = await api.post('/Profile/GetRejectedAds');
      logInfo('getRejectedAds.response', { 
        totalCount: response.data.totalCount, 
        itemsCount: response.data.items?.length || 0 
      });
      return response.data;
    } catch (error) {
      logError('getRejectedAds', error);
      throw new Error('Reddedilen ilanlar alınamadı: ' + (error.response?.data?.message || error.message));
    }
  },
  
  getSelectedAds: async () => {
    try {
      logInfo('getSelectedAds.request', {});
      const response = await api.post('/Profile/GetSelectedAds');
      logInfo('getSelectedAds.response', { 
        totalCount: response.data.totalCount, 
        itemsCount: response.data.items?.length || 0 
      });
      return response.data;
    } catch (error) {
      logError('getSelectedAds', error);
      throw new Error('Favori ilanlar alınamadı: ' + (error.response?.data?.message || error.message));
    }
  }
};

export default profileService; 