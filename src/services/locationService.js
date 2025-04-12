import api from './api';

const logError = (methodName, error) => {
  console.error(`[LocationService] ${methodName} hatası:`, {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
    stack: error.stack
  });
};

const logInfo = (methodName, data) => {
  if (process.env.NODE_ENV === 'development') {
    console.info(`[LocationService] ${methodName}:`, data);
  }
};

const locationService = {
  getAllLocations: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams({
        PageNumber: params.pageNumber || 1,
        PageSize: params.pageSize || 200,
        SortBy: params.sortBy || '',
        IsDescending: params.isDescending || false
      }).toString();
      
      logInfo('getAllLocations.request', { params });
      const response = await api.get(`/Locations/GetAll?${queryParams}`);
      logInfo('getAllLocations.response', response.data);
      return response.data;
    } catch (error) {
      logError('getAllLocations', error);
      throw new Error('Lokasyonlar alınırken bir hata oluştu: ' + (error.response?.data?.message || error.message));
    }
  },
  
  getLocationById: async (id) => {
    try {
      logInfo('getLocationById.request', { id });
      const response = await api.get(`/Locations/GetById?Id=${id}`);
      logInfo('getLocationById.response', response.data);
      return response.data;
    } catch (error) {
      logError('getLocationById', error);
      throw new Error('Lokasyon detayları alınırken bir hata oluştu: ' + (error.response?.data?.message || error.message));
    }
  },
  
  createLocation: async (locationData) => {
    try {
      const requestData = {
        city: locationData.city,
        country: locationData.country
      };

      logInfo('createLocation.request', requestData);
      const response = await api.post('/Locations/Create', requestData);
      logInfo('createLocation.response', response.data);
      return response.data;
    } catch (error) {
      logError('createLocation', error);
      throw new Error('Lokasyon oluşturulurken bir hata oluştu: ' + (error.response?.data?.message || error.message));
    }
  },
  
  updateLocation: async (locationData) => {
    try {
      const requestData = {
        id: locationData.id,
        city: locationData.city,
        country: locationData.country
      };

      logInfo('updateLocation.request', requestData);
      const response = await api.post('/Locations/Update', requestData);
      logInfo('updateLocation.response', response.data);
      return response.data;
    } catch (error) {
      logError('updateLocation', error);
      throw new Error('Lokasyon güncellenirken bir hata oluştu: ' + (error.response?.data?.message || error.message));
    }
  },
  
  deleteLocation: async (id) => {
    try {
      logInfo('deleteLocation.request', { id });
      const response = await api.post('/Locations/Delete', { id });
      logInfo('deleteLocation.response', response.data);
      return response.data;
    } catch (error) {
      logError('deleteLocation', error);
      throw new Error('Lokasyon silinirken bir hata oluştu: ' + (error.response?.data?.message || error.message));
    }
  }
};

export default locationService; 