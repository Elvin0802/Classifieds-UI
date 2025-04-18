import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FaSearch, FaFilter, FaTimes, FaSort, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import AdCard from '../../components/ad/AdCard';
import Pagination from '../../components/common/Pagination';
import adService from '../../services/adService';
import categoryService from '../../services/categoryService';
import locationService from '../../services/locationService';
import debounce from 'lodash.debounce';
import { toast } from 'react-toastify';

function AdsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [ads, setAds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
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
  const fetchAds = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Filtre parametrelerini hazırla
      const params = {
        page: currentPage,
        pageSize: pageSize,
        sortBy: sortBy,
        sortDir: sortDir,
        searchTerm: searchTerm || null,
        minPrice: minPrice ? parseInt(minPrice, 10) : null,
        maxPrice: maxPrice ? parseInt(maxPrice, 10) : null,
        categoryId: selectedCategory || null,
        mainCategoryId: selectedMainCategory || null,
        locationId: selectedLocation || null,
        isNew: isNew === '' ? null : isNew === 'true',
        isFeatured: isFeatured || null,
        status: 'ACTIVE' // Sadece aktif ilanları göster
      };

      // URL parametrelerini güncelle
      const updatedParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== null && value !== '') {
          updatedParams.set(key, value);
        }
      }
      setSearchParams(updatedParams);

      // İlanları al
      const response = await adService.getAll(params);

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

  // Parametreler değiştiğinde ilanları yeniden yükle
  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  // URL'den filtre parametrelerini al
  useEffect(() => {
    const page = searchParams.get('page');
    if (page) setCurrentPage(parseInt(page, 10));
    
    const pageSize = searchParams.get('pageSize');
    if (pageSize) setPageSize(parseInt(pageSize, 10));
    
    const sortBy = searchParams.get('sortBy');
    if (sortBy) setSortBy(sortBy);
    
    const sortDir = searchParams.get('sortDir');
    if (sortDir) setSortDir(sortDir);
    
    const searchTerm = searchParams.get('searchTerm');
    if (searchTerm) setSearchTerm(searchTerm);
    
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
  }, [searchParams]);

  // Arama sonuçlarını gecikme ile uygula
  const debouncedSearch = useCallback(
    debounce(() => {
      setCurrentPage(1); // Arama yapıldığında ilk sayfaya dön
      fetchAds();
    }, 500),
    [fetchAds]
  );

  // Arama yapıldığında
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchAds();
  };

  // Arama alanı değiştiğinde
  const handleSearchInput = (e) => {
    setSearchTerm(e.target.value);
    debouncedSearch();
  };

  // Filtreleri uygula
  const applyFilters = () => {
    setCurrentPage(1);
    fetchAds();
    setShowFilters(false);
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
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  // Favorilere ekle/çıkar
  const handleFavoriteToggle = async (adId) => {
    try {
      const adToUpdate = ads.find(ad => ad.id === adId);
      
      if (adToUpdate.isSelected) {
        await adService.unselectAd(adId);
        toast.success('İlan favorilerden çıkarıldı');
        // Favoriler listesinden kaldır
        setFavoriteAds(favoriteAds.filter(id => id !== adId));
        // İlanlar listesindeki isSelected durumunu güncelle
        setAds(ads.map(ad => ad.id === adId ? { ...ad, isSelected: false } : ad));
      } else {
        await adService.selectAd(adId);
        toast.success('İlan favorilere eklendi');
        // Favoriler listesine ekle
        setFavoriteAds([...favoriteAds, adId]);
        // İlanlar listesindeki isSelected durumunu güncelle
        setAds(ads.map(ad => ad.id === adId ? { ...ad, isSelected: true } : ad));
      }
    } catch (err) {
      console.error('Favori işlemi sırasında hata oluştu:', err);
      toast.error('İşlem sırasında bir hata oluştu');
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
              
              {/* Konum Seçimi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konum
                </label>
                <select
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  <option value="">Tüm Konumlar</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.city}
                    </option>
                  ))}
                </select>
              </div>
              
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
      
      {/* Aktif Filtreler */}
      {(selectedCategory || selectedMainCategory || selectedLocation || minPrice || maxPrice || isNew || isFeatured) && (
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="text-sm font-medium text-gray-700">Aktif Filtreler:</span>
          
          {selectedCategory && (
            <span className="badge badge-outline gap-1">
              Kategori: {categories.find(c => c.id === selectedCategory)?.name}
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setSelectedMainCategory('');
                  setTimeout(() => fetchAds(), 0);
                }}
              >
                <FaTimes className="ml-1 text-xs" />
              </button>
            </span>
          )}
          
          {selectedMainCategory && (
            <span className="badge badge-outline gap-1">
              Alt Kategori: {mainCategories.find(c => c.id === selectedMainCategory)?.name}
              <button
                onClick={() => {
                  setSelectedMainCategory('');
                  setTimeout(() => fetchAds(), 0);
                }}
              >
                <FaTimes className="ml-1 text-xs" />
              </button>
            </span>
          )}
          
          {selectedLocation && (
            <span className="badge badge-outline gap-1">
              Konum: {locations.find(l => l.id === selectedLocation)?.city}
              <button
                onClick={() => {
                  setSelectedLocation('');
                  setTimeout(() => fetchAds(), 0);
                }}
              >
                <FaTimes className="ml-1 text-xs" />
              </button>
            </span>
          )}
          
          {minPrice && (
            <span className="badge badge-outline gap-1">
              Min Fiyat: {minPrice} TL
              <button
                onClick={() => {
                  setMinPrice('');
                  setTimeout(() => fetchAds(), 0);
                }}
              >
                <FaTimes className="ml-1 text-xs" />
              </button>
            </span>
          )}
          
          {maxPrice && (
            <span className="badge badge-outline gap-1">
              Max Fiyat: {maxPrice} TL
              <button
                onClick={() => {
                  setMaxPrice('');
                  setTimeout(() => fetchAds(), 0);
                }}
              >
                <FaTimes className="ml-1 text-xs" />
              </button>
            </span>
          )}
          
          {isNew !== '' && (
            <span className="badge badge-outline gap-1">
              Durum: {isNew === 'true' ? 'Yeni' : 'İkinci El'}
              <button
                onClick={() => {
                  setIsNew('');
                  setTimeout(() => fetchAds(), 0);
                }}
              >
                <FaTimes className="ml-1 text-xs" />
              </button>
            </span>
          )}
          
          {isFeatured && (
            <span className="badge badge-outline gap-1">
              Öne Çıkan İlanlar
              <button
                onClick={() => {
                  setIsFeatured(false);
                  setTimeout(() => fetchAds(), 0);
                }}
              >
                <FaTimes className="ml-1 text-xs" />
              </button>
            </span>
          )}
          
          <button
            className="text-sm text-primary hover:underline"
            onClick={clearFilters}
          >
            Tümünü Temizle
          </button>
        </div>
      )}
      
      {/* Sonuç Özeti */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <span className="text-sm text-gray-500">
            {isLoading ? 'Yükleniyor...' : `${totalCount} ilan bulundu`}
            {searchTerm && ` "${searchTerm}" araması için`}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Sayfa başına:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(parseInt(e.target.value, 10));
              setCurrentPage(1);
            }}
            className="select select-bordered select-sm"
          >
            <option value="12">12</option>
            <option value="24">24</option>
            <option value="36">36</option>
            <option value="48">48</option>
          </select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      ) : ads.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-8 rounded text-center">
          <p className="text-lg font-medium mb-4">Bu arama için sonuç bulunamadı</p>
          <p>Lütfen farklı arama kriterleri deneyin veya filtreleri temizleyin</p>
          <button
            className="mt-4 btn btn-outline btn-sm"
            onClick={clearFilters}
          >
            Filtreleri Temizle
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {ads.map((ad) => (
              <AdCard 
                key={ad.id} 
                ad={ad} 
                onFavoriteToggle={handleFavoriteToggle}
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