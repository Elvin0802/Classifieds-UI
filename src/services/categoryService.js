import api from './api';

const logError = (methodName, error) => {
  console.error(`[CategoryService] ${methodName} hatası:`, {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
    stack: error.stack
  });
};

const logInfo = (methodName, data) => {
  if (process.env.NODE_ENV === 'development') {
    console.info(`[CategoryService] ${methodName}:`, data);
  }
};

const categoryService = {
  // Category operations
  getAllCategories: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams({
        PageNumber: params.pageNumber || 1,
        PageSize: params.pageSize || 10,
        SortBy: params.sortBy || '',
        IsDescending: params.isDescending || false
      }).toString();
      
      logInfo('getAllCategories.request', { params });
      const response = await api.get(`/Categories/all/category?${queryParams}`);
      logInfo('getAllCategories.response', response.data);
      return response.data;
    } catch (error) {
      logError('getAllCategories', error);
      throw new Error('Kategoriler alınırken bir hata oluştu: ' + (error.response?.data?.message || error.message));
    }
  },
  
  getCategoryById: async (id) => {
    try {
      logInfo('getCategoryById.request', { id });
      const response = await api.get(`/Categories/byId/category?Id=${id}`);
      logInfo('getCategoryById.response', response.data);
      
      console.log("Kategori detayları API yanıtı:", response.data);
      
      // API yanıtı direkt olarak mainCategories içeriyor olabilir
      if (response.data && !response.data.categoryDto && response.data.mainCategories) {
        return response.data;
      }
      
      return response.data;
    } catch (error) {
      logError('getCategoryById', error);
      throw new Error('Kategori detayları alınırken bir hata oluştu: ' + (error.response?.data?.message || error.message));
    }
  },
  
  createCategory: async (categoryData) => {
    try {
      const requestData = {
        name: categoryData.name
      };

      logInfo('createCategory.request', requestData);
      const response = await api.post('/Categories/create/category', requestData);
      logInfo('createCategory.response', response.data);
      return response.data;
    } catch (error) {
      logError('createCategory', error);
      throw new Error('Kategori oluşturulurken bir hata oluştu: ' + (error.response?.data?.message || error.message));
    }
  },
  
  // Main Category operations
  getAllMainCategories: async (categoryId) => {
    try {
      logInfo('getAllMainCategories.request', { categoryId });
      
      // Eğer categoryId string olarak geliyorsa, direkt olarak kullan
      if (typeof categoryId === 'string') {
        const response = await api.get(`/Categories/byId/category?Id=${categoryId}`);
        logInfo('getAllMainCategories.response', response.data);
        
        // API yanıtından ana kategorileri çıkar
        if (response.data && response.data.categoryDto && response.data.categoryDto.mainCategories) {
          return { mainCategories: response.data.categoryDto.mainCategories };
        } else if (response.data && response.data.mainCategories) {
          return { mainCategories: response.data.mainCategories };
        } else {
          return { mainCategories: [] };
        }
      }
      
      // Eğer categoryId bir obje olarak geliyorsa, params olarak değerlendir
      const params = categoryId || {};
      const queryParams = new URLSearchParams({
        PageNumber: params.pageNumber || 1,
        PageSize: params.pageSize || 10,
        SortBy: params.sortBy || '',
        IsDescending: params.isDescending || false
      }).toString();
      
      const response = await api.get(`/Categories/all/main-category?${queryParams}`);
      logInfo('getAllMainCategories.response', response.data);
      return response.data;
    } catch (error) {
      logError('getAllMainCategories', error);
      throw new Error('Ana kategoriler alınırken bir hata oluştu: ' + (error.response?.data?.message || error.message));
    }
  },
  
  getMainCategoryById: async (id) => {
    try {
      logInfo('getMainCategoryById.request', { id });
      const response = await api.get(`/Categories/byId/main-category?Id=${id}`);
      logInfo('getMainCategoryById.response', response.data);
      return response.data;
    } catch (error) {
      logError('getMainCategoryById', error);
      throw new Error('Ana kategori detayları alınırken bir hata oluştu: ' + (error.response?.data?.message || error.message));
    }
  },
  
  createMainCategory: async (mainCategoryData) => {
    try {
      const requestData = {
        name: mainCategoryData.name,
        parentCategoryId: mainCategoryData.categoryId || mainCategoryData.parentCategoryId
      };

      logInfo('createMainCategory.request', requestData);
      const response = await api.post('/Categories/create/main-category', requestData);
      logInfo('createMainCategory.response', response.data);
      return response.data;
    } catch (error) {
      logError('createMainCategory', error);
      throw new Error('Ana kategori oluşturulurken bir hata oluştu: ' + (error.response?.data?.message || error.message));
    }
  },
  
  // Sub Category operations
  getAllSubCategories: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams({
        PageNumber: params.pageNumber || 1,
        PageSize: params.pageSize || 10,
        SortBy: params.sortBy || '',
        IsDescending: params.isDescending || false
      }).toString();
      
      logInfo('getAllSubCategories.request', { params });
      const response = await api.get(`/Categories/all/sub-category?${queryParams}`);
      logInfo('getAllSubCategories.response', response.data);
      return response.data;
    } catch (error) {
      logError('getAllSubCategories', error);
      throw new Error('Alt kategoriler alınırken bir hata oluştu: ' + (error.response?.data?.message || error.message));
    }
  },
  
  getSubCategoryById: async (id) => {
    try {
      logInfo('getSubCategoryById.request', { id });
      const response = await api.get(`/Categories/byId/sub-category?Id=${id}`);
      logInfo('getSubCategoryById.response', response.data);
      return response.data;
    } catch (error) {
      logError('getSubCategoryById', error);
      throw new Error('Alt kategori detayları alınırken bir hata oluştu: ' + (error.response?.data?.message || error.message));
    }
  },
  
  createSubCategory: async (subCategoryData) => {
    try {
      // Type değerini sayısal formata dönüştür
      const typeValue = subCategoryData.type === 'select' ? 1 : 0;
      
      // Options'ı string dizisi olarak hazırla
      let optionsArray = [];
      if (subCategoryData.type === 'select' && subCategoryData.options) {
        // API options alanını string dizisi olarak bekliyor
        optionsArray = subCategoryData.options.split(',')
          .map(item => item.trim());
      }

      const requestData = {
        name: subCategoryData.name,
        isRequired: subCategoryData.isRequired,
        isSearchable: true, // Varsayılan olarak true
        type: typeValue,
        mainCategoryId: subCategoryData.mainCategoryId,
        options: optionsArray
      };

      logInfo('createSubCategory.request', requestData);
      const response = await api.post('/Categories/create/sub-category', requestData);
      logInfo('createSubCategory.response', response.data);
      return response.data;
    } catch (error) {
      logError('createSubCategory', error);
      throw new Error('Alt kategori oluşturulurken bir hata oluştu: ' + (error.response?.data?.message || error.message));
    }
  }
};

export default categoryService; 