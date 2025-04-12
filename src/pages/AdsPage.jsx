import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { adService, categoryService, locationService, profileService } from '../services';
import { Loading, AdPreview, VipAdPreview } from '../components/ui';
import { FaFilter, FaSearch, FaSortAmountDown, FaSortAmountUp, FaStar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const AdsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [regularAds, setRegularAds] = useState([]);
  const [featuredAds, setFeaturedAds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    categoryId: searchParams.get('categoryId') || searchParams.get('category') || '',
    mainCategoryId: searchParams.get('mainCategoryId') || '',
    subCategoryId: searchParams.get('subCategoryId') || '',
    locationId: searchParams.get('locationId') || searchParams.get('location') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    searchTerm: searchParams.get('searchTerm') || searchParams.get('search') || '',
    sortBy: searchParams.get('sortBy') || 'newest',
  });
  const [subCategoryValues, setSubCategoryValues] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [favoriteAds, setFavoriteAds] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const categoriesResponse = await categoryService.getAllCategories();
        console.log("Kategoriler yanıt:", categoriesResponse); // API yanıtını kontrol et
        setCategories(categoriesResponse.items || categoriesResponse.categories || []);
        
        // Fetch locations
        const locationsResponse = await locationService.getAllLocations();
        setLocations(locationsResponse.locations || locationsResponse.items || []);
        
        // Ortak filtre parametreleri
        const commonFilters = {
          categoryId: filters.categoryId || null,
          mainCategoryId: filters.mainCategoryId || null,
          locationId: filters.locationId || null,
          minPrice: filters.minPrice !== "" ? filters.minPrice : null,
          maxPrice: filters.maxPrice !== "" ? filters.maxPrice : null,
          searchTerm: filters.searchTerm || null,
          sortBy: getSortByValue(filters.sortBy),
          isDescending: filters.sortBy === "oldest" || filters.sortBy === "priceAsc" ? false : true,
          adStatus: null,
          currentAppUserId: null,
          searchedAppUserId: null,
          subCategoryValues: Object.keys(subCategoryValues).length > 0 ? subCategoryValues : null
        };
        
        // Fetch featured ads (VIP ilanlar)
        const featuredAdsResponse = await adService.getAllAds({
          ...commonFilters,
          isFeatured: true,
          pageNumber: 1,
          pageSize: 8 // Üstte sadece 8 VIP ilan göster
        });
        setFeaturedAds(featuredAdsResponse.items || []);
        
        // Fetch regular ads (Normal ilanlar)
        const regularAdsResponse = await adService.getAllAds({
          ...commonFilters,
          isFeatured: false,
          pageNumber: 1,
          pageSize: 24 // Altta daha fazla normal ilan göster
        });
        setRegularAds(regularAdsResponse.items || []);
      } catch (err) {
        setError('Veriler yüklenirken bir hata oluştu.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters.categoryId, filters.mainCategoryId, filters.locationId, filters.minPrice, filters.maxPrice, filters.searchTerm, filters.sortBy, subCategoryValues]);

  // Kategori seçildiğinde alt kategorileri getir
  useEffect(() => {
    const fetchMainCategories = async () => {
      try {
        if (!filters.categoryId) {
          setMainCategories([]);
          setSubCategories([]);
          return;
        }
        
        const response = await categoryService.getCategoryById(filters.categoryId);
        console.log("Seçilen kategori detayları:", response);
        
        if (response && response.categoryDto && response.categoryDto.mainCategories) {
          setMainCategories(response.categoryDto.mainCategories);
        } else if (response && response.mainCategories) {
          setMainCategories(response.mainCategories);
        } else {
          setMainCategories([]);
        }
      } catch (error) {
        console.error("Ana kategoriler yüklenirken hata:", error);
        setMainCategories([]);
      }
    };

    fetchMainCategories();
  }, [filters.categoryId]);

  // Main Category seçildiğinde Sub Categories'leri getir
  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        if (!filters.mainCategoryId) {
          setSubCategories([]);
          return;
        }
        
        // Ana kategori seçildiğinde alt özellikleri getir
        const mainCategoryIndex = mainCategories.findIndex(m => m.id === filters.mainCategoryId);
        
        if (mainCategoryIndex !== -1 && mainCategories[mainCategoryIndex].subCategories) {
          setSubCategories(mainCategories[mainCategoryIndex].subCategories);
        } else {
          // Eğer alt kategoriler yoksa, getMainCategoryById API'si ile al
          const response = await categoryService.getMainCategoryById(filters.mainCategoryId);
          console.log("Seçilen ana kategori detayları:", response);
          
          if (response && response.mainCategoryDto && response.mainCategoryDto.subCategories) {
            setSubCategories(response.mainCategoryDto.subCategories);
          } else if (response && response.subCategories) {
            setSubCategories(response.subCategories);
          } else {
            setSubCategories([]);
          }
        }
      } catch (error) {
        console.error("Alt kategoriler yüklenirken hata:", error);
        setSubCategories([]);
      }
    };

    fetchSubCategories();
  }, [filters.mainCategoryId, mainCategories]);

  // API'deki switch case ile uyumlu sortBy değerlerini döndüren yardımcı fonksiyon
  const getSortByValue = (sortByOption) => {
    switch (sortByOption) {
      case "priceAsc":
      case "priceDesc":
        return "price";
      case "newest":
      case "oldest":
        return null; // Default case, CreatedAt ile sıralama
      default:
        return null;
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    // Eğer kategori değişirse, mainCategoryId'yi ve subCategoryId'yi sıfırla
    if (name === 'categoryId' && value !== filters.categoryId) {
      setFilters(prev => ({ ...prev, [name]: value, mainCategoryId: '', subCategoryId: '' }));
      setSubCategoryValues({});
      
      // URL parametrelerini güncelle
      const newParams = new URLSearchParams(searchParams);
      if (value) {
        newParams.set(name, value);
      } else {
        newParams.delete(name);
      }
      newParams.delete('mainCategoryId');
      newParams.delete('subCategoryId');
      setSearchParams(newParams);
    } 
    // Eğer ana kategori değişirse, subCategoryId'yi sıfırla
    else if (name === 'mainCategoryId' && value !== filters.mainCategoryId) {
      setFilters(prev => ({ ...prev, [name]: value, subCategoryId: '' }));
      setSubCategoryValues({});
      
      // URL parametrelerini güncelle
      const newParams = new URLSearchParams(searchParams);
      if (value) {
        newParams.set(name, value);
      } else {
        newParams.delete(name);
      }
      newParams.delete('subCategoryId');
      setSearchParams(newParams);
    } 
    else {
      setFilters(prev => ({ ...prev, [name]: value }));
      
      // URL parametrelerini güncelle
      const newParams = new URLSearchParams(searchParams);
      if (value) {
        newParams.set(name, value);
      } else {
        newParams.delete(name);
      }
      setSearchParams(newParams);
    }
  };

  // Alt kategori değerini güncelle (select tipi için)
  const handleSubCategoryValueChange = (subCategoryId, value) => {
    setSubCategoryValues(prev => {
      const newValues = {...prev};
      if (value === "") {
        delete newValues[subCategoryId];
      } else {
        newValues[subCategoryId] = value;
      }
      return newValues;
    });
  };

  // Alt kategori değerini güncelle (input tipi için)
  const handleSubCategoryInputChange = (subCategoryId, value) => {
    setSubCategoryValues(prev => {
      const newValues = {...prev};
      if (value === "") {
        delete newValues[subCategoryId];
      } else {
        newValues[subCategoryId] = value;
      }
      return newValues;
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    if (filters.searchTerm) {
      newParams.set('searchTerm', filters.searchTerm);
    } else {
      newParams.delete('searchTerm');
    }
    setSearchParams(newParams);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const clearFilters = () => {
    setFilters({
      categoryId: '',
      mainCategoryId: '',
      subCategoryId: '',
      locationId: '',
      minPrice: '',
      maxPrice: '',
      searchTerm: '',
      sortBy: 'newest',
    });
    setSubCategoryValues({});
    setSearchParams({});
  };

  // Favorilere ekle/çıkar
  const handleToggleFavorite = async (adId) => {
    if (!isAuthenticated()) {
      toast.error('Favori işlemleri için giriş yapmalısınız.');
      navigate('/login');
      return;
    }
    
    if (!favoriteAds.includes(adId)) {
      try {
        const response = await adService.selectAd(adId);
        if (response.isSucceeded) {
          setFavoriteAds(prev => [...prev, adId]);
          toast.success('İlan favorilere eklendi');
        } else {
          toast.error(response.message || 'İlan favorilere eklenemedi');
        }
      } catch (error) {
        toast.error('İlan favorilere eklenirken bir hata oluştu');
        console.error('Favorilere ekleme hatası:', error);
      }
    } else {
      try {
        const response = await adService.unselectAd(adId);
        if (response.isSucceeded) {
          setFavoriteAds(prev => prev.filter(id => id !== adId));
          toast.success('İlan favorilerden kaldırıldı');
        } else {
          toast.error(response.message || 'İlan favorilerden kaldırılamadı');
        }
      } catch (error) {
        toast.error('İlan favorilerden kaldırılırken bir hata oluştu');
        console.error('Favorilerden kaldırma hatası:', error);
      }
    }
  };

  // Kullanıcı oturum açtıysa, favori ilanları yükle
  useEffect(() => {
    const fetchFavorites = async () => {
      if (isAuthenticated()) {
        try {
          const result = await profileService.getSelectedAds();
          const favoriteIds = result.items?.map(ad => ad.id) || [];
          setFavoriteAds(favoriteIds);
        } catch (error) {
          console.error('Favori ilanlar yüklenirken hata:', error);
        }
      }
    };

    fetchFavorites();
  }, [isAuthenticated]);

  // İlanları render etme
  const renderVipAds = () => {
    const vipAds = featuredAds.length > 0 ? featuredAds : [];

    if (vipAds.length === 0) {
      return null;
    }

    return (
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <span className="bg-yellow-400 text-dark px-2 py-1 rounded-md mr-2 text-sm">VIP</span>
          Öne Çıkan İlanlar
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {vipAds.map((ad) => (
            <Link to={`/ads/${ad.id}`} key={ad.id} className="block hover:no-underline h-full">
              <VipAdPreview
                imageUrl={ad.mainImageUrl || (ad.images && ad.images.length > 0 ? ad.images[0].url : null)}
                title={ad.title}
                location={ad.location?.city || ad.locationCityName || ''}
                price={ad.price}
                date={ad.createdAt || ad.updatedAt}
                isFavorite={favoriteAds.includes(ad.id)}
                onFavoriteToggle={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleToggleFavorite(ad.id);
                }}
              />
            </Link>
          ))}
        </div>
      </div>
    );
  };

  // Normal ilanları render etme
  const renderNormalAds = () => {
    // VIP olmayan ilanları filtrele - VIP ilanların ID'lerini alıp normal ilanlardan çıkar
    const vipAdIds = featuredAds.map(ad => ad.id);
    const normalAds = regularAds.filter(ad => !vipAdIds.includes(ad.id));

    if (normalAds.length === 0) {
      return <p className="text-center py-4">Gösterilecek ilan bulunamadı.</p>;
    }

    return (
      <div>
        <h3 className="text-xl font-semibold mb-4">İlanlar</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {normalAds.map((ad) => (
            <Link to={`/ads/${ad.id}`} key={ad.id} className="block hover:no-underline h-full">
              <AdPreview
                imageUrl={ad.mainImageUrl || (ad.images && ad.images.length > 0 ? ad.images[0].url : null)}
                title={ad.title}
                location={ad.location?.city || ad.locationCityName || ''}
                price={ad.price}
                date={ad.createdAt || ad.updatedAt}
                isFavorite={favoriteAds.includes(ad.id)}
                onFavoriteToggle={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleToggleFavorite(ad.id);
                }}
              />
            </Link>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tüm İlanlar</h1>
        <button 
          onClick={toggleFilters}
          className="flex items-center space-x-2 btn btn-outline md:hidden"
        >
          <FaFilter />
          <span>Filtreler</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filters - Desktop */}
        <div className="hidden md:block">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold mb-4">Filtreler</h2>
            
            <form onSubmit={handleSearch} className="mb-4">
              <div className="flex">
                <input
                  type="text"
                  name="searchTerm"
                  value={filters.searchTerm}
                  onChange={handleFilterChange}
                  placeholder="İlan ara..."
                  className="input rounded-r-none flex-grow"
                />
                <button 
                  type="submit" 
                  className="bg-primary text-white px-4 rounded-r-md flex items-center justify-center"
                >
                  <FaSearch />
                </button>
              </div>
            </form>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Kategori</label>
                <select
                  name="categoryId"
                  value={filters.categoryId}
                  onChange={handleFilterChange}
                  className="input"
                >
                  <option value="">Tüm Kategoriler</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {mainCategories.length > 0 && (
                <div>
                  <label className="block text-gray-700 mb-2">Alt Kategori</label>
                  <select
                    name="mainCategoryId"
                    value={filters.mainCategoryId}
                    onChange={handleFilterChange}
                    className="input"
                  >
                    <option value="">Tüm Alt Kategoriler</option>
                    {mainCategories.map(mainCategory => (
                      <option key={mainCategory.id} value={mainCategory.id}>
                        {mainCategory.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {/* Sub Category seçenekleri - Seçilen ana kategoriye göre filtreler */}
              {subCategories.length > 0 && (
                <div className="border-t pt-3 mt-3">
                  <h3 className="font-medium text-gray-800 mb-3">Özellikler</h3>
                  <div className="space-y-3">
                    {subCategories.map(subCategory => (
                      <div key={subCategory.id}>
                        <label className="block text-gray-700 mb-1 text-sm">
                          {subCategory.name}
                          {subCategory.isRequired && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        
                        {subCategory.type === 0 ? (
                          // Text/Sayı giriş alanı
                          <input
                            type="text"
                            value={subCategoryValues[subCategory.id] || ''}
                            onChange={(e) => handleSubCategoryInputChange(subCategory.id, e.target.value)}
                            placeholder={subCategory.name}
                            className="input"
                          />
                        ) : (
                          // Select (Dropdown) alanı
                          <select
                            value={subCategoryValues[subCategory.id] || ''}
                            onChange={(e) => handleSubCategoryValueChange(subCategory.id, e.target.value)}
                            className="input"
                          >
                            <option value="">Seçiniz</option>
                            {subCategory.options.map(option => (
                              <option key={option.id} value={option.value}>
                                {option.value}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-gray-700 mb-2">Konum</label>
                <select
                  name="locationId"
                  value={filters.locationId}
                  onChange={handleFilterChange}
                  className="input"
                >
                  <option value="">Tüm Konumlar</option>
                  {locations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.city}, {location.country}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Fiyat Aralığı</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    placeholder="Min"
                    className="input"
                  />
                  <input
                    type="number"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    placeholder="Max"
                    className="input"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Sıralama</label>
                <select
                  name="sortBy"
                  value={filters.sortBy}
                  onChange={handleFilterChange}
                  className="input"
                >
                  <option value="newest">En Yeni</option>
                  <option value="oldest">En Eski</option>
                  <option value="priceAsc">Fiyat (Artan)</option>
                  <option value="priceDesc">Fiyat (Azalan)</option>
                </select>
              </div>
            </div>
            
            <button
              onClick={clearFilters}
              className="btn btn-outline w-full mt-4"
            >
              Filtreleri Temizle
            </button>
          </div>
        </div>
        
        {/* Filters - Mobile */}
        {showFilters && (
          <div className="md:hidden fixed inset-0 bg-white z-50 p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Filtreler</h2>
              <button 
                onClick={toggleFilters}
                className="text-gray-500"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            
            <form onSubmit={handleSearch} className="mb-4">
              <div className="flex">
                <input
                  type="text"
                  name="searchTerm"
                  value={filters.searchTerm}
                  onChange={handleFilterChange}
                  placeholder="İlan ara..."
                  className="input rounded-r-none flex-grow"
                />
                <button 
                  type="submit" 
                  className="bg-primary text-white px-4 rounded-r-md flex items-center justify-center"
                >
                  <FaSearch />
                </button>
              </div>
            </form>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Kategori</label>
                <select
                  name="categoryId"
                  value={filters.categoryId}
                  onChange={handleFilterChange}
                  className="input"
                >
                  <option value="">Tüm Kategoriler</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {mainCategories.length > 0 && (
                <div>
                  <label className="block text-gray-700 mb-2">Alt Kategori</label>
                  <select
                    name="mainCategoryId"
                    value={filters.mainCategoryId}
                    onChange={handleFilterChange}
                    className="input"
                  >
                    <option value="">Tüm Alt Kategoriler</option>
                    {mainCategories.map(mainCategory => (
                      <option key={mainCategory.id} value={mainCategory.id}>
                        {mainCategory.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {/* Mobile için Sub Category seçenekleri */}
              {subCategories.length > 0 && (
                <div className="border-t pt-3 mt-3">
                  <h3 className="font-medium text-gray-800 mb-3">Özellikler</h3>
                  <div className="space-y-3">
                    {subCategories.map(subCategory => (
                      <div key={subCategory.id}>
                        <label className="block text-gray-700 mb-1 text-sm">
                          {subCategory.name}
                          {subCategory.isRequired && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        
                        {subCategory.type === 0 ? (
                          // Text/Sayı giriş alanı
                          <input
                            type="text"
                            value={subCategoryValues[subCategory.id] || ''}
                            onChange={(e) => handleSubCategoryInputChange(subCategory.id, e.target.value)}
                            placeholder={subCategory.name}
                            className="input"
                          />
                        ) : (
                          // Select (Dropdown) alanı
                          <select
                            value={subCategoryValues[subCategory.id] || ''}
                            onChange={(e) => handleSubCategoryValueChange(subCategory.id, e.target.value)}
                            className="input"
                          >
                            <option value="">Seçiniz</option>
                            {subCategory.options.map(option => (
                              <option key={option.id} value={option.value}>
                                {option.value}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-gray-700 mb-2">Konum</label>
                <select
                  name="locationId"
                  value={filters.locationId}
                  onChange={handleFilterChange}
                  className="input"
                >
                  <option value="">Tüm Konumlar</option>
                  {locations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.city}, {location.country}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Fiyat Aralığı</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    placeholder="Min"
                    className="input"
                  />
                  <input
                    type="number"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    placeholder="Max"
                    className="input"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Sıralama</label>
                <select
                  name="sortBy"
                  value={filters.sortBy}
                  onChange={handleFilterChange}
                  className="input"
                >
                  <option value="newest">En Yeni</option>
                  <option value="oldest">En Eski</option>
                  <option value="priceAsc">Fiyat (Artan)</option>
                  <option value="priceDesc">Fiyat (Azalan)</option>
                </select>
              </div>
              
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="btn btn-outline flex-1"
                >
                  Filtreleri Temizle
                </button>
                <button
                  type="button"
                  onClick={toggleFilters}
                  className="btn btn-primary flex-1"
                >
                  Uygula
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Ads Grid */}
        <div className="md:col-span-3">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {/* Sort options - Mobile */}
          <div className="md:hidden mb-4">
            <select
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              className="input"
            >
              <option value="newest">En Yeni</option>
              <option value="oldest">En Eski</option>
              <option value="priceAsc">Fiyat (Artan)</option>
              <option value="priceDesc">Fiyat (Azalan)</option>
            </select>
          </div>
          
          {/* Results count */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="flex flex-wrap justify-between items-center">
              <p className="font-medium">
                {loading ? (
                  "İlanlar aranıyor..."
                ) : (
                  `${featuredAds.length + regularAds.length} sonuç bulundu`
                )}
              </p>
              
              <div className="flex items-center space-x-4">
                <span className="text-gray-500">Sıralama:</span>
                <select
                  name="sortBy"
                  value={filters.sortBy}
                  onChange={handleFilterChange}
                  className="border p-2 rounded"
                >
                  <option value="newest">En Yeni</option>
                  <option value="oldest">En Eski</option>
                  <option value="priceAsc">Fiyat (Artan)</option>
                  <option value="priceDesc">Fiyat (Azalan)</option>
                </select>
              </div>
            </div>
          </div>
          
          {loading ? (
            <Loading />
          ) : (
            <>
              {renderVipAds()}
              {renderNormalAds()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdsPage; 