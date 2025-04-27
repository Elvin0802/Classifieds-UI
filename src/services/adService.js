import apiClient from './axiosConfig';
import { API_URL } from '../config';
import authStorage from './authStorage';
import profileService from './profileService';

const ADS_URL = `${API_URL}/Ads`;

/**
 * İlan durumları
 */
export const AdStatus = {
  PENDING: 0,
  ACTIVE: 1,
  REJECTED: 2,
  SOLD: 3,
  EXPIRED: 4
};

// Giriş yapmış kullanıcı ID'sini al
let currentUserId = null;

const getCurrentUserId = async () => {
  if (currentUserId) return currentUserId;
  
  // Kullanıcı giriş yapmış mı kontrol et
  const isLoggedIn = authStorage.getIsLogin();
  if (!isLoggedIn) return null;
  
  try {
    // Profil bilgilerini al
    const profileResponse = await profileService.getUserData();
    if (profileResponse?.isSucceeded && profileResponse?.data?.item?.id) {
      currentUserId = profileResponse.data.item.id;
      return currentUserId;
    }
    return null;
  } catch (error) {
    console.error('Kullanıcı profili alınamadı:', error);
    return null;
  }
};

const adService = {
  /**
   * İlanları getir (filtreleme, sıralama ve sayfalama parametreleri ile)
   * @param {Object} params - Sorgu parametreleri
   * @returns {Promise<Object>} İlan listesi sonucu
   * @example
   * // Örnek parametre yapısı
   * {
   *   pageNumber: 1,
   *   pageSize: 10,
   *   sortBy: "updatedAt",
   *   isDescending: true,
   *   searchTitle: "Araba", // Aramak için, kullanmıyorsak null gönder
   *   isFeatured: true, // Öne çıkan ilanlar için
   *   minPrice: 1000, // Minimum fiyat filtresi
   *   maxPrice: 5000, // Maksimum fiyat filtresi
   *   categoryId: "guid", // Kategori filtresi
   *   mainCategoryId: "guid", // Ana kategori filtresi
   *   locationId: "guid", // Lokasyon filtresi
   *   currentAppUserId: "guid", // Mevcut kullanıcının ID'si
   *   searchedAppUserId: "guid", // Aranan kullanıcının ID'si
   *   adStatus: 1, // İlan durumu (0: Beklemede, 1: Aktif, 2: Reddedilmiş, 3: Satıldı, 4: Süresi Dolmuş)
   *   subCategoryValues: { // Alt kategori değerleri
   *     "additionalProp1": "değer1",
   *     "additionalProp2": "değer2",
   *     "additionalProp3": "değer3"
   *   }
   * }
   */
  getAll: async (params = {}) => {
    try {
      // Varsayılan değerler
      const defaultValues = {
        pageNumber: 1,
        pageSize: 20,
        isDescending: true,
        adStatus: 1 // Aktif ilanlar
      };
      
      // API'nin beklediği formatta bir obje oluştur
      const apiParams = {
        ...defaultValues
      };
      
      // searchTerm parametresini searchTitle'a dönüştür
      if (params.searchTerm !== undefined) {
        apiParams.searchTitle = params.searchTerm;
      }
      
      // sortDir parametresini isDescending'e dönüştür
      if (params.sortDir !== undefined) {
        apiParams.isDescending = params.sortDir === 'desc';
      }
      
      // Diğer parametreleri doğrudan kopyala
      const directParams = [
        'pageNumber', 'pageSize', 'sortBy', 'searchTitle', 
        'isFeatured', 'minPrice', 'maxPrice', 'categoryId', 
        'mainCategoryId', 'locationId', 'searchedAppUserId', 
        'adStatus', 'isNew'
      ];
      
      directParams.forEach(param => {
        if (params[param] !== undefined) {
          apiParams[param] = params[param];
        }
      });
      
      // SubCategoryValues dönüşümü
      if (params.subCategoryFilters && typeof params.subCategoryFilters === 'object') {
        apiParams.subCategoryValues = params.subCategoryFilters;
      } else if (params.subCategoryValues && typeof params.subCategoryValues === 'object') {
        apiParams.subCategoryValues = params.subCategoryValues;
      }
      
      // Kullanıcı ID'sini al ve ekle
      const userId = await getCurrentUserId();
      if (userId) {
        apiParams.currentAppUserId = userId;
        console.log('Kullanıcı ID eklendi:', userId);
      }
      
      // isFeatured parametresi için her zaman boolean değer gönder
      if (params.isFeatured !== undefined) {
        apiParams.isFeatured = Boolean(params.isFeatured);
      }
      
      // Tüm parametreleri eksiksiz gönder
      // Null olan parametreleri de gönder
      Object.keys(defaultValues).forEach(key => {
        if (apiParams[key] === undefined) {
          apiParams[key] = null;
        }
      });
      
      console.log('API isteği gönderiliyor:', apiParams);
      
      // POST methodu ile body içinde tüm parametreleri gönder
      const response = await apiClient.post(`${ADS_URL}/GetAll`, apiParams);
      return response.data;
    } catch (error) {
      console.error('İlanlar alınırken hata:', error);
      throw error;
    }
  },
  
  /**
   * İlan detayını getir
   * @param {string} adId - İlan ID'si
   * @returns {Promise<Object>} İlan detayı sonucu
   */
  getById: async (adId) => {
    try {
      // Query parametrelerini oluştur
      const params = { id: adId };
      
      // Kullanıcı ID'sini al ve ekle
      const userId = await getCurrentUserId();
      if (userId) {
        params.currentAppUserId = userId;
        console.log('İlan detayı için kullanıcı ID eklendi:', userId);
      }
      
      const response = await apiClient.get(`${ADS_URL}/GetById`, { params });
      return response.data;
    } catch (error) {
      console.error('İlan detayı alınırken hata:', error);
      throw error;
    }
  },
  
  /**
   * Yeni ilan oluştur
   * @param {Object} adData - İlan verileri
   * @returns {Promise<Object>} Oluşturma sonucu
   * @example
   * // Örnek veri yapısı
   * {
   *   title: "İlan Başlığı",
   *   description: "İlan Açıklaması",
   *   price: 1000,
   *   isNew: true,
   *   categoryId: "guid",
   *   mainCategoryId: "guid",
   *   locationId: "guid",
   *   subCategoryValues: [
   *     {
   *       value: "değer",
   *       subCategoryId: "guid"
   *     }
   *   ]
   * }
   */
  create: async (adData) => {
    try {
      const response = await apiClient.post(`${ADS_URL}/Create`, adData);
      return response.data;
    } catch (error) {
      console.error('İlan oluşturulurken hata:', error);
      throw error;
    }
  },
  
  /**
   * Yeni ilan ve resimlerini birlikte oluştur (multipart/form-data)
   * @param {FormData} formData - Form verileri (ilan bilgileri ve resimler)
   * @returns {Promise<Object>} Oluşturma sonucu
   */
  createWithImages: async (formData) => {
    try {
      console.log('createWithImages fonksiyonu çağrıldı');
      
      // FormData içeriğini logla
      console.log('FormData içeriği (adService):');
      for (let pair of formData.entries()) {
        console.log('=> ' + pair[0] + ':', 
          pair[0] === 'SubCategoryValuesJson' ? JSON.parse(pair[1]) : 
          typeof pair[1] === 'string' && pair[1].length < 100 ? pair[1] : '[Dosya veya uzun içerik]');
      }
      
      // API isteği gönder
      const response = await apiClient.post(`${ADS_URL}/Create`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Yanıtı logla
      console.log('API yanıtı:', response.status, response.data);
      
      // Axios response formatını döndür (status, data, headers, vb. içerir)
      return {
        status: response.status,
        data: response.data?.data || response.data,
        isSucceeded: response.data?.isSucceeded || (response.status >= 200 && response.status < 300),
        message: response.data?.message || 'İşlem başarılı'
      };
    } catch (error) {
      console.error('İlan ve resimler yüklenirken hata:', error.response?.data || error.message);
      // Hata durumunda da benzer bir format döndür
      throw {
        status: error.response?.status || 500,
        data: error.response?.data,
        message: error.response?.data?.message || error.message,
        isSucceeded: false,
        originalError: error
      };
    }
  },
  
  /**
   * İlan güncelle
   * @param {Object} adData - Güncellenecek ilan verileri
   * @returns {Promise<Object>} Güncelleme sonucu
   * @example
   * // Örnek veri yapısı
   * {
   *   id: "guid",
   *   description: "Yeni açıklama",
   *   price: 1500,
   *   isNew: false
   * }
   */
  update: async (adData) => {
    try {
      const response = await apiClient.post(`${ADS_URL}/Update`, adData);
      return response.data;
    } catch (error) {
      console.error('İlan güncellenirken hata:', error);
      throw error;
    }
  },
  
  /**
   * İlan sil
   * @param {string} adId - İlan ID'si
   * @returns {Promise<Object>} Silme sonucu
   */
  delete: async (adId) => {
    try {
      const response = await apiClient.post(`${ADS_URL}/Delete`, {
        id: adId
      });
      return response.data;
    } catch (error) {
      console.error('İlan silinirken hata:', error);
      throw error;
    }
  },
  
  /**
   * İlanı seç (favori/saklanan)
   * @param {string} adId - İlan ID'si
   * @returns {Promise<Object>} Seçim sonucu
   */
  selectAd: async (adId) => {
    try {
      const response = await apiClient.post(`${ADS_URL}/SelectAd`, {
        selectAdId: adId
      });
      return response.data;
    } catch (error) {
      console.error('İlan seçilirken hata:', error);
      throw error;
    }
  },
  
  /**
   * İlan seçimini kaldır (favori/saklanan)
   * @param {string} adId - İlan ID'si
   * @returns {Promise<Object>} Seçim kaldırma sonucu
   */
  unselectAd: async (adId) => {
    try {
      const response = await apiClient.post(`${ADS_URL}/UnselectAd`, {
        selectAdId: adId
      });
      return response.data;
    } catch (error) {
      console.error('İlan seçimi kaldırılırken hata:', error);
      throw error;
    }
  },
  
  /**
   * Fiyatlandırma seçeneklerini getir
   * @returns {Promise<Object>} Fiyatlandırma seçenekleri
   */
  getPricingOptions: async () => {
    try {
      const response = await apiClient.get(`${ADS_URL}/GetPricingOptions`);
      return response.data;
    } catch (error) {
      console.error('Fiyatlandırma seçenekleri alınırken hata:', error);
      throw error;
    }
  },
  
  /**
   * İlanı öne çıkar
   * @param {string} adId - İlan ID'si
   * @param {number} durationDays - Öne çıkarma süresi (gün)
   * @returns {Promise<Object>} Öne çıkarma sonucu
   */
  featureAd: async (adId, durationDays) => {
    try {
      const response = await apiClient.post(`${ADS_URL}/FeatureAd`, {
        adId,
        durationDays
      });
      return response.data;
    } catch (error) {
      console.error('İlan öne çıkarılırken hata:', error);
      throw error;
    }
  },
  
  /**
   * İlan durumunu değiştir (admin)
   * @param {string} adId - İlan ID'si
   * @param {number} newAdStatus - Yeni durum (0: Pending, 1: Active, 2: Rejected, 3: Sold, 4: Expired)
   * @returns {Promise<Object>} Durum değiştirme sonucu
   */
  changeAdStatus: async (adId, newAdStatus) => {
    try {
      const response = await apiClient.post(`${ADS_URL}/ChangeAdStatus`, {
        adId,
        newAdStatus
      });
      return response.data;
    } catch (error) {
      console.error('İlan durumu değiştirilirken hata:', error);
      throw error;
    }
  },
  
  /**
   * İlan resmi yükle
   * @param {string} adId - İlan ID'si
   * @param {File} imageFile - Yüklenecek resim dosyası
   * @returns {Promise<Object>} Yükleme sonucu
   */
  uploadAdImage: async (adId, imageFile) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('adId', adId);
      
      const response = await apiClient.post(`${ADS_URL}/UploadImage`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('İlan resmi yüklenirken hata:', error);
      throw error;
    }
  },
  
  /**
   * Öne çıkan ilanları getir
   * @param {Object} params - Sorgu parametreleri (sayfalama, sıralama, vb.)
   * @returns {Promise<Object>} Öne çıkan ilanlar sonucu
   */
  getFeaturedAds: async (params = {}) => {
    try {
      const featuredParams = {
        ...params,
        isFeatured: true,
        adStatus: 1 // Sadece aktif ilanlar
      };
      
      // searchTerm parametresini searchTitle'a dönüştür
      if (params.searchTerm !== undefined) {
        featuredParams.searchTitle = params.searchTerm;
        delete featuredParams.searchTerm;
      }
      
      // Kullanıcı ID'sini al ve ekle
      const userId = await getCurrentUserId();
      if (userId) {
        featuredParams.currentAppUserId = userId;
        console.log('Öne çıkan ilanlar için kullanıcı ID eklendi:', userId);
      }
      
      // Öne çıkan ilanlar için default değerler
      if (!featuredParams.pageNumber) featuredParams.pageNumber = 1;
      if (!featuredParams.pageSize) featuredParams.pageSize = 12;
      if (!featuredParams.sortBy) featuredParams.sortBy = 'createdAt';
      if (featuredParams.isDescending === undefined) featuredParams.isDescending = true;
      
      console.log('Öne çıkan ilanlar için istek parametreleri:', featuredParams);
      return await adService.getAll(featuredParams);
    } catch (error) {
      console.error('Öne çıkan ilanlar alınırken hata:', error);
      throw error;
    }
  },
  
  /**
   * Popüler ilanları getir
   * @param {Object} params - Sorgu parametreleri
   * @returns {Promise<Object>} Popüler ilanlar sonucu
   */
  getPopularAds: async (params = {}) => {
    try {
      const popularParams = {
        ...params,
        sortBy: "viewCount",
        isDescending: true
      };
      return await adService.getAll(popularParams);
    } catch (error) {
      console.error('Popüler ilanlar alınırken hata:', error);
      throw error;
    }
  },
  
  /**
   * En yeni ilanları getir
   * @param {Object} params - Sorgu parametreleri
   * @returns {Promise<Object>} En yeni ilanlar sonucu
   */
  getRecentAds: async (params = {}) => {
    try {
      const recentParams = {
        ...params,
        sortBy: "createdAt",
        isDescending: true
      };
      return await adService.getAll(recentParams);
    } catch (error) {
      console.error('En yeni ilanlar alınırken hata:', error);
      throw error;
    }
  },
  
  /**
   * Bir kullanıcının ilanlarını getir
   * @param {string} userId - Kullanıcı ID'si
   * @param {Object} params - Diğer sorgu parametreleri
   * @returns {Promise<Object>} Kullanıcının ilanları
   */
  getUserAds: async (userId, params = {}) => {
    try {
      const userAdsParams = {
        ...params,
        searchedAppUserId: userId
      };
      return await adService.getAll(userAdsParams);
    } catch (error) {
      console.error('Kullanıcı ilanları alınırken hata:', error);
      throw error;
    }
  },
  
  /**
   * Bir kategorideki ilanları getir
   * @param {string} categoryId - Kategori ID'si
   * @param {Object} params - Diğer sorgu parametreleri
   * @returns {Promise<Object>} Kategorideki ilanlar
   */
  getCategoryAds: async (categoryId, params = {}) => {
    try {
      const categoryAdsParams = {
        ...params,
        categoryId
      };
      return await adService.getAll(categoryAdsParams);
    } catch (error) {
      console.error('Kategori ilanları alınırken hata:', error);
      throw error;
    }
  },
  
  /**
   * Bir ana kategorideki ilanları getir
   * @param {string} mainCategoryId - Ana kategori ID'si
   * @param {Object} params - Diğer sorgu parametreleri
   * @returns {Promise<Object>} Ana kategorideki ilanlar
   */
  getMainCategoryAds: async (mainCategoryId, params = {}) => {
    try {
      const mainCategoryAdsParams = {
        ...params,
        mainCategoryId
      };
      return await adService.getAll(mainCategoryAdsParams);
    } catch (error) {
      console.error('Ana kategori ilanları alınırken hata:', error);
      throw error;
    }
  },
  
  /**
   * Bir lokasyondaki ilanları getir
   * @param {string} locationId - Lokasyon ID'si
   * @param {Object} params - Diğer sorgu parametreleri
   * @returns {Promise<Object>} Lokasyondaki ilanlar
   */
  getLocationAds: async (locationId, params = {}) => {
    try {
      const locationAdsParams = {
        ...params,
        locationId
      };
      return await adService.getAll(locationAdsParams);
    } catch (error) {
      console.error('Lokasyon ilanları alınırken hata:', error);
      throw error;
    }
  }
};

export default adService; 