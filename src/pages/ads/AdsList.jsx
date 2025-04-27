import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FaSearch, FaFilter, FaTimes, FaSort, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import AdCard from '../../components/ad/AdCard';
import Pagination from '../../components/common/Pagination';
import adService from '../../services/adService';
import categoryService from '../../services/categoryService';
import locationService from '../../services/locationService';
import debounce from 'lodash.debounce';
import { toast } from 'react-toastify';
import React from 'react';

function AdsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [ads, setAds] = useState([]);
  const [featuredAds, setFeaturedAds] = useState([]); // Öne çıkan ilanlar için ayrı state
  const [isLoading, setIsLoading] = useState(true);
  const [isFeaturedLoading, setIsFeaturedLoading] = useState(true); // Öne çıkan ilanlar için yükleme durumu
  const [error, setError] = useState(null);
  const [featuredError, setFeaturedError] = useState(null); // Öne çıkan ilanlar için hata durumu
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoryId') || '');
  const [selectedMainCategory, setSelectedMainCategory] = useState(searchParams.get('mainCategoryId') || '');
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('locationId') || '');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('searchTerm') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [sortDir, setSortDir] = useState(searchParams.get('sortDir') || 'desc');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(parseInt(searchParams.get('pageSize') || '12', 10));
  const [showFilters, setShowFilters] = useState(false);
  const [favoriteAds, setFavoriteAds] = useState([]);
  const [isNew, setIsNew] = useState(searchParams.get('isNew') || '');
  const [isFeatured, setIsFeatured] = useState(searchParams.get('isFeatured') === 'true');

  // Kategorileri ve konumları yükle
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        // Kategorileri yükle
        const categoryResponse = await categoryService.getAllCategories();
        if (categoryResponse && categoryResponse.isSucceeded && categoryResponse.data) {
          setCategories(categoryResponse.data.items);
        }

        // Konumları yükle
        const locationResponse = await locationService.getAll();
        if (locationResponse && locationResponse.isSucceeded && locationResponse.data) {
          setLocations(locationResponse.data.items);
        }
      } catch (err) {
        console.error('Filtreler yüklenirken hata oluştu:', err);
        setError('Filtre seçenekleri yüklenemedi.');
      }
    };

    fetchFilters();
  }, []);
  
  // Öne çıkan ilanları getir - Sayfa yüklendiğinde ve filtreleme parametreleri değiştiğinde çalışacak
  useEffect(() => {
    const fetchFeaturedAds = async () => {
      setIsFeaturedLoading(true);
      setFeaturedError(null);
      
      try {
        // Kategori ve lokasyon filtreleri öne çıkan ilanlar için de geçerli olsun
        const featuredParams = {
          pageNumber: 1,
          pageSize: 12, // Üstte 12 öne çıkan ilan göster
          sortBy: sortBy,
          isDescending: sortDir === 'desc',
          adStatus: 1, // Aktif ilanlar
          categoryId: selectedCategory || null,
          mainCategoryId: selectedMainCategory || null,
          locationId: selectedLocation || null,
          searchTitle: searchTerm || null,
          minPrice: minPrice ? parseInt(minPrice, 10) : null,
          maxPrice: maxPrice ? parseInt(maxPrice, 10) : null,
          isNew: isNew === '' ? null : isNew === 'true',
          isFeatured: true // Her zaman true gönder
        };
        
        console.log('Öne çıkan ilanlar için istek parametreleri:', featuredParams);
        
        const response = await adService.getFeaturedAds(featuredParams);
        
        if (response && response.data && response.data.items) {
          setFeaturedAds(response.data.items);
        } else {
          setFeaturedError('Öne çıkan ilanlar yüklenemedi.');
          setFeaturedAds([]);
        }
      } catch (err) {
        console.error('Öne çıkan ilanlar yüklenirken hata oluştu:', err);
        setFeaturedError('Öne çıkan ilanlar yüklenemedi.');
        setFeaturedAds([]);
      } finally {
        setIsFeaturedLoading(false);
      }
    };
    
    // Sadece "isFeatured" true değilse öne çıkan ilanları ayrıca getir
    // Eğer "isFeatured" true ise, normal fetchAds işlemi zaten öne çıkan ilanları getirecek
    if (!isFeatured) {
      fetchFeaturedAds();
    } else {
      setFeaturedAds([]); // isFeatured filtreleniyorsa öne çıkan ilanları temizle
      setIsFeaturedLoading(false);
    }
  }, [selectedCategory, selectedMainCategory, selectedLocation, searchTerm, minPrice, maxPrice, isNew, sortBy, sortDir, isFeatured]);

  // Seçilen kategoriye bağlı olarak alt kategorileri yükle
  useEffect(() => {
    const fetchMainCategories = async () => {
      if (!selectedCategory) {
        setMainCategories([]);
        return;
      }

      try {
        const categoryToSearch = categories.find(cat => cat.id === selectedCategory);
        if (categoryToSearch && categoryToSearch.mainCategories) {
          setMainCategories(categoryToSearch.mainCategories);
        } else {
          setMainCategories([]);
        }
      } catch (err) {
        console.error('Alt kategoriler yüklenirken hata oluştu:', err);
        setMainCategories([]);
      }
    };

    fetchMainCategories();
  }, [selectedCategory, categories]);

  // İlanları getir
  const fetchAds = useCallback(async (options = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      // API'ye gönderilecek parametreleri hazırla
      const apiParams = {
        pageNumber: options.currentPage || currentPage,
        pageSize: options.pageSize || pageSize,
        sortBy: options.sortBy || sortBy || null,
        isDescending: options.sortDir ? options.sortDir === 'desc' : sortDir === 'desc',
        searchTitle: options.searchTerm || searchTerm || null,
        minPrice: options.minPrice ? parseInt(options.minPrice, 10) : minPrice ? parseInt(minPrice, 10) : null,
        maxPrice: options.maxPrice ? parseInt(options.maxPrice, 10) : maxPrice ? parseInt(maxPrice, 10) : null,
        categoryId: options.selectedCategory || selectedCategory || null,
        mainCategoryId: options.selectedMainCategory || selectedMainCategory || null,
        locationId: options.selectedLocation || selectedLocation || null,
        isNew: options.isNew === '' ? null : options.isNew === 'true',
        isFeatured: options.isFeatured === undefined ? (isFeatured === undefined ? false : Boolean(isFeatured)) : Boolean(options.isFeatured),
        adStatus: 1 // Sadece aktif ilanları göster
      };

      // URL parametrelerini güncelle (sadece fetchAds doğrudan çağrıldığında)
      if (!options.skipUrlUpdate) {
        const updatedParams = new URLSearchParams();
        for (const [key, value] of Object.entries({
          page: apiParams.pageNumber,
          pageSize: apiParams.pageSize,
          sortBy: apiParams.sortBy,
          sortDir: apiParams.isDescending ? 'desc' : 'asc',
          searchTerm: apiParams.searchTitle,
          minPrice: apiParams.minPrice,
          maxPrice: apiParams.maxPrice,
          categoryId: apiParams.categoryId,
          mainCategoryId: apiParams.mainCategoryId,
          locationId: apiParams.locationId,
          isNew: apiParams.isNew === null ? '' : String(apiParams.isNew),
          isFeatured: apiParams.isFeatured
        })) {
          if (value !== null && value !== undefined && value !== '') {
            updatedParams.set(key, value);
          }
        }
        setSearchParams(updatedParams, { replace: true }); // replace: true kullanarak ekstra tarayıcı geçmişi oluşturmasını engelliyoruz
      }
      
      console.log('Normal ilanlar için istek parametreleri:', apiParams);

      // İlanları al - Doğrudan API parametrelerini gönder
      const response = await adService.getAll(apiParams);

      if (response && response.isSucceeded && response.data) {
        setAds(response.data.items);
        setTotalPages(response.data.totalPages);
        setTotalCount(response.data.totalCount);
        
        // Favoriler
        if (response.data.items && response.data.items.length > 0) {
          setFavoriteAds(response.data.items.filter(ad => ad.isSelected).map(ad => ad.id));
        }
      } else {
        setError('İlanlar yüklenirken bir hata oluştu.');
        setAds([]);
      }
    } catch (err) {
      console.error('İlanlar yüklenirken hata oluştu:', err);
      setError('İlanlar yüklenemedi. Lütfen daha sonra tekrar deneyin.');
      setAds([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    pageSize,
    sortBy,
    sortDir,
    searchTerm,
    minPrice,
    maxPrice,
    selectedCategory,
    selectedMainCategory,
    selectedLocation,
    isNew,
    isFeatured,
    setSearchParams
  ]);

  // Sayfa ilk yüklendiğinde ilanları getir
  useEffect(() => {
    // Sadece komponent mount edildiğinde çalış
    fetchAds({ skipUrlUpdate: true });
    // fetchAds'in bağımlılık listesini burada belirtmiyoruz çünkü 
    // her değiştiğinde çağrılmasını istemiyoruz
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // URL parametreleri değiştiğinde güncelle (ama istek gönderme)
  useEffect(() => {
    // URL'den parametreleri almak için bu useEffect'i koruyoruz
    // Ama ilanları otomatik yüklemiyoruz, URL değiştiğinde
    const page = searchParams.get('page');
    if (page && parseInt(page, 10) !== currentPage) {
      setCurrentPage(parseInt(page, 10));
    }
    
    const pageSize = searchParams.get('pageSize');
    if (pageSize && parseInt(pageSize, 10) !== currentPage) {
      setPageSize(parseInt(pageSize, 10));
    }
    
    // Diğer parametreler sadece URL'den okunacak ama otomatik istek gönderilmeyecek
    const sortBy = searchParams.get('sortBy');
    if (sortBy) setSortBy(sortBy);
    
    const sortDir = searchParams.get('sortDir');
    if (sortDir) setSortDir(sortDir);
    
    const searchTerm = searchParams.get('searchTerm');
    // searchTerm güncellendiğinde otomatik istek göndermeyi önle
    if (searchTerm && searchTerm !== searchTermRef.current) {
      setSearchTerm(searchTerm);
      searchTermRef.current = searchTerm;
    }
    
    const minPrice = searchParams.get('minPrice');
    if (minPrice) setMinPrice(minPrice);
    
    const maxPrice = searchParams.get('maxPrice');
    if (maxPrice) setMaxPrice(maxPrice);
    
    const categoryId = searchParams.get('categoryId');
    if (categoryId) setSelectedCategory(categoryId);
    
    const mainCategoryId = searchParams.get('mainCategoryId');
    if (mainCategoryId) setSelectedMainCategory(mainCategoryId);
    
    const locationId = searchParams.get('locationId');
    if (locationId) setSelectedLocation(locationId);
    
    const isNew = searchParams.get('isNew');
    if (isNew) setIsNew(isNew);
    
    const isFeatured = searchParams.get('isFeatured');
    if (isFeatured) setIsFeatured(isFeatured === 'true');
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Bu ref, arama teriminin son değerini takip etmek için
  const searchTermRef = React.useRef(searchTerm);
  
  // currentPage değiştiğinde ilanları getir
  useEffect(() => {
    // Sadece sayfa değiştiğinde yeni istekler yap
    if (currentPage > 0) {
      fetchAds({ skipUrlUpdate: false });
    }
  }, [currentPage, fetchAds]);

  // Arama sonuçlarını gecikme ile uygula
  const debouncedSearchRef = useRef(null);
  
  // Component mount edildiğinde debounced search oluştur
  useEffect(() => {
    debouncedSearchRef.current = debounce((term) => {
      console.log('Debounced arama terimi:', term);
      // searchTermRef güncellemesi
      searchTermRef.current = term;
      // URL parametrelerini güncelle
      const updatedParams = new URLSearchParams(searchParams);
      if (term) {
        updatedParams.set('searchTerm', term);
      } else {
        updatedParams.delete('searchTerm');
      }
      updatedParams.set('page', '1');
      setSearchParams(updatedParams, { replace: true });
      
      // Sayfa 1'e dön ve yeni istek gönder
      setCurrentPage(1);
      fetchAds({ searchTerm: term, currentPage: 1, skipUrlUpdate: true });
    }, 500);
    
    // Komponent unmount edildiğinde debounce fonksiyonunu temizle
    return () => {
      if (debouncedSearchRef.current) {
        debouncedSearchRef.current.cancel();
      }
    };
  }, [fetchAds, searchParams, setSearchParams]);

  // Arama yapıldığında
  const handleSearch = (e) => {
    e.preventDefault();
    fetchAds({
      currentPage: 1, // Arama yaparken her zaman ilk sayfadan başla
      searchTitle: searchTerm
    });
  };

  // Arama alanı değiştiğinde
  const handleSearchInput = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    // Debounce fonksiyonu ile searchTerm değişimine göre istek gönder
    if (debouncedSearchRef.current) {
      debouncedSearchRef.current(term);
    }
  };

  // Filtreleri uygula
  const applyFilters = () => {
    fetchAds({
      currentPage: 1 // Filtreleri uygularken ilk sayfaya dön
    });
    setShowFilters(false); // Filtre menüsünü kapat
  };

  // Filtreleri temizle
  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedMainCategory('');
    setSelectedLocation('');
    setMinPrice('');
    setMaxPrice('');
    setIsNew('');
    setIsFeatured(false);
    setCurrentPage(1);
    
    // Temizlenen filtrelerle ilanları yeniden yükle
    setTimeout(() => {
      fetchAds();
    }, 0);
    
    setShowFilters(false);
  };

  // Sayfa değişikliğini işle
  const handlePageChange = (newPage) => {
    // Sayfa değiştiğinde API'yi çağır
    fetchAds({ currentPage: newPage });
  };

  // Favorilere ekle/çıkar
  const handleFavoriteToggle = async (adId) => {
    try {
      // Önce ilanı bul
      const adToUpdate = ads.find(ad => ad.id === adId) || 
                      featuredAds.find(ad => ad.id === adId);
      
      if (!adToUpdate) {
        console.error('İlan bulunamadı:', adId);
        toast.error('İşlem yapılacak ilan bulunamadı');
        return;
      }
      
      // İlanın sahibiyse favoriye ekleme
      if (adToUpdate.isOwner) {
        toast.info('Kendi ilanınızı favorilere ekleyemezsiniz');
        return;
      }

      console.log('İlan işlemi:', adToUpdate);
      
      // İlanın durumuna göre işlem yap
      if (adToUpdate.isSelected) {
        // Önce UI'ı güncelle
        if (ads.find(ad => ad.id === adId)) {
          setAds(ads.map(ad => ad.id === adId ? { ...ad, isSelected: false } : ad));
        }
        
        if (featuredAds.find(ad => ad.id === adId)) {
          setFeaturedAds(featuredAds.map(ad => ad.id === adId ? { ...ad, isSelected: false } : ad));
        }
        
        setFavoriteAds(favoriteAds.filter(id => id !== adId));
        toast.success('İlan favorilerden çıkarıldı');
        
        // Sonra API isteği gönder
        await adService.unselectAd(adId);
      } else {
        // Önce UI'ı güncelle
        if (ads.find(ad => ad.id === adId)) {
          setAds(ads.map(ad => ad.id === adId ? { ...ad, isSelected: true } : ad));
        }
        
        if (featuredAds.find(ad => ad.id === adId)) {
          setFeaturedAds(featuredAds.map(ad => ad.id === adId ? { ...ad, isSelected: true } : ad));
        }
        
        setFavoriteAds([...favoriteAds, adId]);
        toast.success('İlan favorilere eklendi');
        
        // Sonra API isteği gönder
        await adService.selectAd(adId);
      }
    } catch (err) {
      console.error('Favori işlemi sırasında hata oluştu:', err);
      toast.error('İşlem sırasında bir hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
      
      // Hata durumunda ilanları tekrar yükle
      setTimeout(() => {
        fetchAds();
      }, 500);
    }
  };

  // Sıralama değişikliği
  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      // Aynı alan için sıralama yönünü değiştir
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      // Yeni alan için varsayılan sıralama
      setSortBy(newSortBy);
      setSortDir('desc');
    }
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">İlanlar</h1>
      
      {/* Arama ve Filtre Başlığı */}
      <div className="bg-white shadow-md rounded-lg mb-6">
        <div className="p-4">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-2">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg pr-10"
                  placeholder="İlan ara..."
                  value={searchTerm}
                  onChange={handleSearchInput}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary"
                >
                  <FaSearch />
                </button>
              </div>
            </div>
            
            {/* Lokasyon filtresi - Ana arama çubuğunda */}
            <div className="w-48">
              <select
                className="w-full px-3 py-2 border rounded-lg bg-white"
                value={selectedLocation}
                onChange={(e) => {
                  setSelectedLocation(e.target.value);
                  setTimeout(() => fetchAds(), 0);
                }}
              >
                <option value="">Tüm Konumlar</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.city}, {location.country}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              type="button"
              className="btn btn-outline gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter /> Filtreler
            </button>
            
            <div className="dropdown dropdown-end">
              <button type="button" className="btn btn-outline gap-2">
                <FaSort /> Sırala
              </button>
              <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-10">
                <li onClick={() => handleSortChange('createdAt')}>
                  <a className={`flex items-center justify-between ${sortBy === 'createdAt' ? 'font-bold' : ''}`}>
                    Tarihe Göre
                    {sortBy === 'createdAt' && (
                      sortDir === 'desc' ? <FaSortAmountDown /> : <FaSortAmountUp />
                    )}
                  </a>
                </li>
                <li onClick={() => handleSortChange('price')}>
                  <a className={`flex items-center justify-between ${sortBy === 'price' ? 'font-bold' : ''}`}>
                    Fiyata Göre
                    {sortBy === 'price' && (
                      sortDir === 'desc' ? <FaSortAmountDown /> : <FaSortAmountUp />
                    )}
                  </a>
                </li>
                <li onClick={() => handleSortChange('viewCount')}>
                  <a className={`flex items-center justify-between ${sortBy === 'viewCount' ? 'font-bold' : ''}`}>
                    Görüntülenmeye Göre
                    {sortBy === 'viewCount' && (
                      sortDir === 'desc' ? <FaSortAmountDown /> : <FaSortAmountUp />
                    )}
                  </a>
                </li>
              </ul>
            </div>
          </form>
        </div>
        
        {/* Filtreler */}
        {showFilters && (
          <div className="p-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Kategori Seçimi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori
                </label>
                <select
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedMainCategory('');
                  }}
                >
                  <option value="">Tüm Kategoriler</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Alt Kategori Seçimi */}
              {selectedCategory && mainCategories.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alt Kategori
                  </label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                    value={selectedMainCategory}
                    onChange={(e) => setSelectedMainCategory(e.target.value)}
                  >
                    <option value="">Tüm Alt Kategoriler</option>
                    {mainCategories.map((mainCategory) => (
                      <option key={mainCategory.id} value={mainCategory.id}>
                        {mainCategory.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {/* Fiyat Aralığı */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Fiyat
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Min Fiyat"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maksimum Fiyat
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Max Fiyat"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  min="0"
                />
              </div>
              
              {/* Durum */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durum
                </label>
                <select
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                  value={isNew}
                  onChange={(e) => setIsNew(e.target.value)}
                >
                  <option value="">Tümü</option>
                  <option value="true">Yeni</option>
                  <option value="false">İkinci El</option>
                </select>
              </div>
              
              {/* Öne Çıkan İlanlar */}
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                  />
                  <span className="text-sm font-medium text-gray-700">Sadece Öne Çıkan İlanlar</span>
                </label>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                className="btn btn-ghost gap-2"
                onClick={clearFilters}
              >
                <FaTimes /> Filtreleri Temizle
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={applyFilters}
              >
                Filtreleri Uygula
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Öne Çıkan İlanlar Bölümü */}
      {!isFeatured && featuredAds.length > 0 && (
        <div className="mb-8">
          <div className="border-b pb-2 mb-4">
            <h2 className="text-xl font-semibold">Öne Çıkan İlanlar</h2>
          </div>
          
          {isFeaturedLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : featuredError ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {featuredError}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {featuredAds.map((ad) => (
                <AdCard 
                  key={ad.id} 
                  ad={ad}
                  onFavoriteToggle={() => handleFavoriteToggle(ad.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Tüm İlanlar veya Filtrelenmiş İlanlar */}
      <div>
        <div className="border-b pb-2 mb-4">
          <h2 className="text-xl font-semibold">
            {isFeatured ? 'Öne Çıkan İlanlar' : 'İlanlar'}
            {totalCount > 0 && ` (${totalCount})`}
          </h2>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : ads.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">Aranan kriterlere uygun ilan bulunamadı.</p>
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
            >
              Filtreleri Temizle
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {ads.map((ad) => (
                <AdCard 
                  key={ad.id} 
                  ad={ad}
                  onFavoriteToggle={() => handleFavoriteToggle(ad.id)}
                />
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Yeni İlan Ekleme */}
      <div className="fixed bottom-8 right-8">
        <Link to="/ilanlar/yeni" className="btn btn-primary rounded-full shadow-lg btn-lg">
          + Yeni İlan Ekle
        </Link>
      </div>
    </div>
  );
}

export default AdsList; 