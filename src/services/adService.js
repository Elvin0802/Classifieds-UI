import api from './api';
import authService from './authService';

const logError = (methodName, error) => {
  console.error(`[AdService] ${methodName} hatası:`, {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
    stack: error.stack
  });
};

const logInfo = (methodName, data) => {
  if (process.env.NODE_ENV === 'development') {
    console.info(`[AdService] ${methodName}:`, data);
  }
};

// Boş GUID değeri
const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";

// Mevcut kullanıcı ID'sini alır
const getCurrentUserId = async () => {
  try {
    if (authService.isAuthenticated()) {
      const userData = await authService.getCurrentUser();
      return userData.id || EMPTY_GUID;
    }
    return EMPTY_GUID;
  } catch (error) {
    console.error("Kullanıcı ID'si alınırken hata:", error);
    return EMPTY_GUID;
  }
};

const adService = {
  getAllAds: async (filters = {}) => {
    try {
      // Kullanıcı ID'sini al
      const currentUserId = await getCurrentUserId();
      
      const requestData = {
        pageNumber: filters.pageNumber !== undefined ? filters.pageNumber : 1,
        pageSize: filters.pageSize !== undefined ? filters.pageSize : 32,
        sortBy: filters.sortBy || null,
        isDescending: filters.sortBy === "oldest" ? false : true,
        searchTitle: filters.searchTerm || null,
        isFeatured: filters.isFeatured !== undefined ? filters.isFeatured : false,
        minPrice: filters.minPrice !== undefined && filters.minPrice !== "" ? filters.minPrice : null,
        maxPrice: filters.maxPrice !== undefined && filters.maxPrice !== "" ? filters.maxPrice : null,
        categoryId: filters.categoryId || null,
        mainCategoryId: filters.mainCategoryId || null,
        locationId: filters.locationId || null,
        currentAppUserId: currentUserId, // Güncel kullanıcı ID'si
        searchedAppUserId: filters.searchedAppUserId || null,
        adStatus: filters.adStatus !== undefined ? filters.adStatus : 0,
        subCategoryValues: Object.keys(filters.subCategoryValues || {}).length > 0 ? filters.subCategoryValues : null
      };

      logInfo('getAllAds.request', requestData);
      const response = await api.post('/Ads/GetAll', requestData);
      logInfo('getAllAds.response', response.data);
      return response.data;
    } catch (error) {
      logError('getAllAds', error);
      throw new Error('İlanlar alınırken bir hata oluştu: ' + (error.response?.data?.message || error.message));
    }
  },
  
  getAdById: async (id) => {
    try {
      // Kullanıcı ID'sini al
      const currentUserId = await getCurrentUserId();
      
      logInfo('getAdById.request', { id, currentUserId });
      const response = await api.get(`/Ads/GetById?Id=${id}&CurrentUserId=${currentUserId}`);
      logInfo('getAdById.response', response.data);
      return response.data;
    } catch (error) {
      logError('getAdById', error);
      throw new Error('İlan detayları alınırken bir hata oluştu: ' + (error.response?.data?.message || error.message));
    }
  },
  
  createAd: async (adData) => {
    try {
      logInfo('createAd.request', adData);
      
      // Form verilerini oluştur
      const formData = new FormData();
      
      // Temel ad bilgilerini ekle
      formData.append('title', adData.title);
      formData.append('description', adData.description);
      formData.append('price', adData.price);
      formData.append('categoryId', adData.categoryId);
      formData.append('locationCityId', adData.locationCityId);
      formData.append('locationDistrictId', adData.locationDistrictId);
      formData.append('isNew', adData.isNew);
      
      // Özellikleri ekle
      if (adData.properties && adData.properties.length > 0) {
        adData.properties.forEach((prop, index) => {
          formData.append(`properties[${index}].propertyId`, prop.propertyId);
          formData.append(`properties[${index}].value`, prop.value);
        });
      }
      
      // Resimleri ekle
      if (adData.images && adData.images.length > 0) {
        adData.images.forEach(image => {
          formData.append('images', image);
        });
      }
      
      const response = await api.post('/Ads/CreateAd', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      logInfo('createAd.response', response.data);
      return response.data;
    } catch (error) {
      logError('createAd', error);
      throw new Error('İlan oluşturulurken bir hata oluştu: ' + (error.response?.data?.message || error.message));
    }
  },
  
  updateAd: async (updateData) => {
    try {
      logInfo('updateAd.request', updateData);
      const response = await api.put('/Ads/UpdateAd', updateData);
      logInfo('updateAd.response', response.data);
      return response.data;
    } catch (error) {
      logError('updateAd', error);
      throw new Error('İlan güncellenirken bir hata oluştu: ' + (error.response?.data?.message || error.message));
    }
  },
  
  deleteAd: async (adId) => {
    try {
      logInfo('deleteAd.request', { adId });
      const response = await api.delete(`/Ads/DeleteAd/${adId}`);
      logInfo('deleteAd.response', response.data);
      return response.data;
    } catch (error) {
      logError('deleteAd', error);
      throw new Error('İlan silinirken bir hata oluştu: ' + (error.response?.data?.message || error.message));
    }
  },
  
  selectAd: async (adId) => {
    try {
      logInfo('selectAd.request', { adId });
      const response = await api.post(`/Ads/SelectAd/${adId}`);
      logInfo('selectAd.response', response.data);
      return response.data;
    } catch (error) {
      logError('selectAd', error);
      throw new Error('İlan favorilere eklenirken bir hata oluştu: ' + (error.response?.data?.message || error.message));
    }
  },
  
  unselectAd: async (adId) => {
    try {
      logInfo('unselectAd.request', { adId });
      const response = await api.post(`/Ads/UnselectAd/${adId}`);
      logInfo('unselectAd.response', response.data);
      return response.data;
    } catch (error) {
      logError('unselectAd', error);
      throw new Error('İlan favorilerden kaldırılırken bir hata oluştu: ' + (error.response?.data?.message || error.message));
    }
  },
  
  // VIP ilan fiyatlandırma seçeneklerini getiren metot
  getPricingOptions: async () => {
    try {
      logInfo('getPricingOptions.request', {});
      const response = await api.get('/Ads/GetPricingOptions');
      logInfo('getPricingOptions.response', response.data);
      return response.data;
    } catch (error) {
      logError('getPricingOptions', error);
      throw new Error('VIP fiyatlandırma seçenekleri alınırken bir hata oluştu: ' + (error.response?.data?.message || error.message));
    }
  },
  
  // İlanı VIP yapma metodu
  featureAd: async (adId, days) => {
    try {
      const requestData = {
        adId: adId,
        appUserId: EMPTY_GUID,
        durationDays: days
      };
      
      logInfo('featureAd.request', requestData);
      const response = await api.post('/Ads/FeatureAd', requestData);
      logInfo('featureAd.response', response.data);
      return response.data;
    } catch (error) {
      logError('featureAd', error);
      throw new Error('İlan VIP yapılırken bir hata oluştu: ' + (error.response?.data?.message || error.message));
    }
  }
};

export default adService; 