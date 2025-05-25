import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, X, SortAsc, SortDesc, ArrowUpDown, Check, CircleX, CirclePlus } from 'lucide-react';
import AdCard from '../../components/ad/AdCard';
import Pagination from '../../components/common/Pagination';
import adService from '../../services/adService';
import categoryService from '../../services/categoryService';
import locationService from '../../services/locationService';
import debounce from 'lodash.debounce';
import { toast } from 'react-toastify';
import React from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Separator } from '../../components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from '../../components/ui/sheet';
import { Card, CardContent } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import authStorage from '../../services/authStorage';

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
  const [isNew, setIsNew] = useState(
    searchParams.get('isNew') === null ? null : searchParams.get('isNew') === 'true' ? true : searchParams.get('isNew') === 'false' ? false : null
  );
  const [isFeatured, setIsFeatured] = useState(
    searchParams.get('isFeatured') === null ? null : searchParams.get('isFeatured') === 'true' ? true : searchParams.get('isFeatured') === 'false' ? false : null
  );
  const [searchedAppUserId, setSearchedAppUserId] = useState(() => {
    const param = searchParams.get('searchedAppUserId');
    return param ? param : '';
  });

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
        setError('Filtrlər yüklənmədi.');
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
          isDescending: sortDir === 'desc', // Boolean değer olarak doğrudan gönder
          adStatus: 1, // Aktif ilanlar
          categoryId: selectedCategory || null,
          mainCategoryId: selectedMainCategory || null,
          locationId: selectedLocation || null,
          searchTitle: searchTerm || null,
          minPrice: minPrice ? parseInt(minPrice, 10) : null,
          maxPrice: maxPrice ? parseInt(maxPrice, 10) : null,
          isNew: isNew,
          isFeatured: isFeatured,
        };
        
        console.log('Öne çıkan ilanlar için istek parametreleri:', featuredParams);
        
        const response = await adService.getFeaturedAds(featuredParams);
        
        if (response && response.data && response.data.items) {
          setFeaturedAds(response.data.items);
        } else {
          setFeaturedError('xəta.');
          setFeaturedAds([]);
        }
      } catch (err) {
        console.error('Öne çıkan ilanlar yüklenirken hata oluştu:', err);
        setFeaturedError('xəta.');
        setFeaturedAds([]);
      } finally {
        setIsFeaturedLoading(false);
      }
    };
    
    // Sadece "isFeatured" true değilse öne çıkan ilanları ayrıca getir
    // Eğer "isFeatured" true ise, normal fetchAds işlemi zaten öne çıkan ilanları getirecek
    if (isFeatured === null) {
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
        isNew: typeof isNew === 'boolean' ? isNew : null,
        isFeatured: typeof isFeatured === 'boolean' ? isFeatured : null,
        adStatus: 1,
        searchedAppUserId: options.searchedAppUserId !== undefined
          ? (options.searchedAppUserId === '' ? null : options.searchedAppUserId)
          : (searchedAppUserId === '' ? null : searchedAppUserId)
      };

      // Debugging için log
      console.log('Arama terimi:', options.searchTerm || searchTerm);
      console.log('API parametreleri:', apiParams);
      console.log('Sıralama:', apiParams.sortBy, 'isDescending:', apiParams.isDescending);

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
          isNew: isNew === null ? '' : String(isNew),
          isFeatured: isFeatured === null ? '' : String(isFeatured),
          searchedAppUserId: apiParams.searchedAppUserId
        })) {
          if (value !== null && value !== undefined && value !== '') {
            updatedParams.set(key, value);
          }
        }
        setSearchParams(updatedParams, { replace: true });
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
        setError('xəta.');
        setAds([]);
      }
    } catch (err) {
      console.error('İlanlar yüklenirken hata oluştu:', err);
      setError('xəta');
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
    searchedAppUserId,
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
    if (isNew) setIsNew(isNew === 'true');
    
    const isFeatured = searchParams.get('isFeatured');
    if (isFeatured) setIsFeatured(isFeatured === 'true');

    const searchedAppUserIdParam = searchParams.get('searchedAppUserId');
    if (searchedAppUserIdParam !== undefined) setSearchedAppUserId(searchedAppUserIdParam || '');
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Bu ref, arama teriminin son değerini takip etmek için
  const searchTermRef = React.useRef(searchTerm);
  
  // currentPage değiştiğinde ilanları getir
  useEffect(() => {
    // Sadece sayfa değiştiğinde API'yi çağır
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
      fetchAds({ 
        searchTerm: term, 
        currentPage: 1, 
        skipUrlUpdate: true 
      });
    }, 500);
    
    // Komponent unmount edildiğinde debounce fonksiyonunu temizle
    return () => {
      if (debouncedSearchRef.current) {
        debouncedSearchRef.current.cancel();
      }
    };
  }, [fetchAds, searchParams, setSearchParams]);

  // Arama alanı değiştiğinde
  const handleSearchInput = (e) => {
    const term = e.target.value;
    setSearchTerm(term); // State güncellemesi
    
    // Değer boşsa anında temizle, debounce kullanma
    if (!term.trim()) {
      // URL'den searchTerm parametresini kaldır
      const updatedParams = new URLSearchParams(searchParams);
      updatedParams.delete('searchTerm');
      setSearchParams(updatedParams, { replace: true });
      
      // Anında aramaları temizle
      fetchAds({
        searchTerm: '', 
        currentPage: 1,
      });
      return;
    }
    
    // Debounce fonksiyonu ile searchTerm değişimine göre istek gönder
    if (debouncedSearchRef.current) {
      debouncedSearchRef.current(term);
    }
  };

  // Arama yapıldığında
  const handleSearch = (e) => {
    if (e.key === undefined || e.key === 'Enter') {
      // Form submit olduğunda veya Enter tuşuna basıldığında
      e.preventDefault();
      
      console.log('Arama yapılıyor:', searchTerm);
      
      fetchAds({
        currentPage: 1, // Arama yaparken her zaman ilk sayfadan başla
        searchTerm: searchTerm // searchTerm değeri API'ye gönderilecek
      });
    }
  };

  // Filtreleri uygula
  const applyFilters = () => {
    fetchAds({
      currentPage: 1,
      searchedAppUserId
    });
    setShowFilters(false);
  };

  // Filtreleri temizle
  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedMainCategory('');
    setSelectedLocation('');
    setMinPrice('');
    setMaxPrice('');
    setIsNew(null);
    setIsFeatured(null);
    setCurrentPage(1);
    setSearchedAppUserId('');
    // Temizlenen filtrelerle ilanları yeniden yükle
    setTimeout(() => {
      fetchAds({ searchedAppUserId: '' });
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
        toast.error('elan yoxdur.');
        return;
      }
      
      // Kendi ilanımızı favoriye ekleyemeyiz
      if (adToUpdate.isOwner) {
        toast.info('Öz elanınızı seçə bilməzsiniz.');
        return;
      }

      console.log('İlan işlemi:', adToUpdate);
      
      // İlanın durumuna göre işlem yap
      if (adToUpdate.isSelected) {
        // Önce API isteği gönder ve başarılı olursa UI'ı güncelle
        const response = await adService.unselectAd(adId);
        
        if (response && response.isSucceeded) {
          // UI'ı güncelle
          if (ads.find(ad => ad.id === adId)) {
            setAds(ads.map(ad => ad.id === adId ? { ...ad, isSelected: false } : ad));
          }
          
          if (featuredAds.find(ad => ad.id === adId)) {
            setFeaturedAds(featuredAds.map(ad => ad.id === adId ? { ...ad, isSelected: false } : ad));
          }
          
          setFavoriteAds(favoriteAds.filter(id => id !== adId));
          toast.success('elan çıxarıldı.');
        } else {
          toast.error('xəta: İşlem başarısız oldu');
        }
      } else {
        // Önce API isteği gönder ve başarılı olursa UI'ı güncelle
        const response = await adService.selectAd(adId);
        
        if (response && response.isSucceeded) {
          // UI'ı güncelle
          if (ads.find(ad => ad.id === adId)) {
            setAds(ads.map(ad => ad.id === adId ? { ...ad, isSelected: true } : ad));
          }
          
          if (featuredAds.find(ad => ad.id === adId)) {
            setFeaturedAds(featuredAds.map(ad => ad.id === adId ? { ...ad, isSelected: true } : ad));
          }
          
          setFavoriteAds([...favoriteAds, adId]);
          toast.success('elan əlavə olundu.');
        } else {
          toast.error('xəta: İşlem başarısız oldu');
        }
      }
    } catch (err) {
      console.error('Favori işlemi sırasında hata oluştu:', err);
      toast.error('xəta: ' + (err.message || 'xəta'));
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
    <div className="container mx-auto px-4 py-6">
      {/* Arama ve Filtreleme Başlığı */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2 mb-2">
          <Search className="h-6 w-6 text-primary" /> 
          Elanlar
        </h1>
        <p className="text-muted-foreground">
          {searchTerm && ` "${searchTerm}" axtarışı üçün`}
          {selectedCategory && categories.find(c => c.id === selectedCategory) && 
            ` - ${categories.find(c => c.id === selectedCategory).name} kategoriyasında`}
        </p>
      </div>

      {/* Arama ve Filtreleme Alanı */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* Arama Çubuğu */}
          <div className="flex-1 relative">
            <form onSubmit={handleSearch} className="w-full relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                type="text"
                placeholder="Elan axtar..."
                value={searchTerm}
                onChange={handleSearchInput}
                onKeyDown={handleSearch}
                className="pl-10 w-full"
              />
            </form>
          </div>

          {/* Mobil ekran için filtreleri göster/gizle butonu */}
          <div className="flex gap-2 md:hidden">
            <Button 
              onClick={() => setShowFilters(true)} 
              variant="outline" 
              className="w-full flex items-center gap-2"
            >
              <Filter className="h-4 w-4" /> Filterlər
            </Button>
          </div>
        </div>

        {/* Masaüstü için Filtre Alanı */}
        <div className="hidden md:flex flex-wrap gap-4 mb-4">
          {/* Kategori Seçimi */}
          <div className="w-72">
            <Select 
              value={selectedCategory || "all"} 
              onValueChange={(value) => {
                setSelectedCategory(value === "all" ? "" : value);
                setSelectedMainCategory(''); // Alt kategoriyi sıfırla
                // Filtreleri Uygula butonuna tıklandığında uygulanacak
              }}
            >
              <SelectTrigger className="bg-white dark:bg-gray-900 shadow-sm border-gray-300 dark:border-gray-700">
                <SelectValue placeholder="Kategori Seçin" className="font-medium" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-medium">Bütün Kategoriyalar</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id} className="font-medium">
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Alt Kategori Seçimi - Sadece kategori seçildiğinde göster */}
          {selectedCategory && mainCategories.length > 0 && (
            <div className="w-72">
              <Select 
                value={selectedMainCategory || "all"} 
                onValueChange={(value) => setSelectedMainCategory(value === "all" ? "" : value)}
              >
                <SelectTrigger className="bg-white dark:bg-gray-900 shadow-sm border-gray-300 dark:border-gray-700">
                  <SelectValue placeholder="Alt Kategori Seçin" className="font-medium" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="font-medium">Bütün Alt Kategoriyalar</SelectItem>
                  {mainCategories.map(category => (
                    <SelectItem key={category.id} value={category.id} className="font-medium">
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Konum Seçimi */}
          <div className="w-72">
            <Select 
              value={selectedLocation || "all"} 
              onValueChange={(value) => setSelectedLocation(value === "all" ? "" : value)}
            >
              <SelectTrigger className="bg-white dark:bg-gray-900 shadow-sm border-gray-300 dark:border-gray-700">
                <SelectValue placeholder="Məkan Seçin" className="font-medium" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-medium">Bütün Məkanlar</SelectItem>
                {locations.map(location => (
                  <SelectItem key={location.id} value={location.id} className="font-medium">
                    {location.city}, {location.country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fiyat Aralığı */}
          <div className="w-96 flex gap-2 items-center">
            <Input
              type="number"
              placeholder="Min Qiymət"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-36"
            />
            <span className="text-foreground">-</span>
            <Input
              type="number"
              placeholder="Max Qiymət"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-36"
            />
          </div>

          {/* Sıralama Seçimi */}
          <div className="w-72">
            <Select 
              value={sortBy === 'createdAt' ? (sortDir === 'desc' ? 'createdAt-desc' : 'createdAt-asc') : 
                      sortBy === 'price' ? (sortDir === 'desc' ? 'price-desc' : 'price-asc') : 'createdAt-desc'} 
              onValueChange={(value) => {
                const [newSortBy, newSortDir] = value.split('-');
                setSortBy(newSortBy);
                setSortDir(newSortDir);
                // Sıralama değiştiğinde hemen filtrele
                fetchAds({ 
                  sortBy: newSortBy, 
                  sortDir: newSortDir
                });
              }}
            >
              <SelectTrigger className="bg-white dark:bg-gray-900 shadow-sm border-gray-300 dark:border-gray-700">
                <SelectValue placeholder="Sıralama Seçin" className="font-medium" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-desc" className="font-medium">Ən Yeni</SelectItem>
                <SelectItem value="createdAt-asc" className="font-medium">Ən Köhnə</SelectItem>
                <SelectItem value="price-asc" className="font-medium">Qiymət (Aşağıdan Yuxarıya)</SelectItem>
                <SelectItem value="price-desc" className="font-medium">Qiymət (Yuxarıdan Aşağıya)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Masaüstü için ek filtreler ve butonlar */}
        <div className="hidden md:flex justify-between items-center mb-2">
          <div className="flex items-center gap-6">
            {/* isNew üçlü seçim */}
            <div className="flex items-center gap-2">
              <Label className="cursor-pointer">Məhsulun vəziyyəti:</Label>
              <Select
                value={isNew === null ? 'all' : isNew === true ? 'new' : 'old'}
                onValueChange={value => {
                  if (value === 'all') setIsNew(null);
                  else if (value === 'new') setIsNew(true);
                  else setIsNew(false);
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Hamısı</SelectItem>
                  <SelectItem value="new">Yalnız Yeni</SelectItem>
                  <SelectItem value="old">Yalnız Köhnə</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* isFeatured üçlü seçim */}
            <div className="flex items-center gap-2">
              <Label className="cursor-pointer">VİP Elan:</Label>
              <Select
                value={isFeatured === null ? 'all' : isFeatured === true ? 'featured' : 'notfeatured'}
                onValueChange={value => {
                  if (value === 'all') setIsFeatured(null);
                  else if (value === 'featured') setIsFeatured(true);
                  else setIsFeatured(false);
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Hamısı</SelectItem>
                  <SelectItem value="featured">Yalnız VİP</SelectItem>
                  <SelectItem value="notfeatured">Yalnız Normal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={clearFilters} size="sm" className="flex items-center gap-1">
              <CircleX className="h-3 w-3" /> Filterləri Təmizlə
            </Button>
            <Button onClick={applyFilters} size="sm" className="flex items-center gap-1">
              <Filter className="h-3 w-3" /> Filterləri Tətbiq Et
            </Button>
          </div>
        </div>

        {/* Mobil ekranda filtreler için yan panel */}
        <Sheet open={showFilters} onOpenChange={setShowFilters}>
          <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto max-h-[100vh]">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" /> Elan Filterləri
              </SheetTitle>
            </SheetHeader>
            
            <div className="py-6 space-y-6">
              <div className="space-y-3">
                <Label className="text-foreground">Kategoriya</Label>
                <Select 
                  value={selectedCategory || "all"} 
                  onValueChange={(value) => {
                    setSelectedCategory(value === "all" ? "" : value);
                    setSelectedMainCategory('');
                  }}
                >
                  <SelectTrigger className="bg-white dark:bg-gray-900 shadow-sm border-gray-300 dark:border-gray-700">
                    <SelectValue placeholder="Kategori Seçin" className="font-medium" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="font-medium">Bütün Kategoriyalar</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id} className="font-medium">
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCategory && mainCategories.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-foreground">Alt Kategoriya</Label>
                  <Select 
                    value={selectedMainCategory || "all"} 
                    onValueChange={(value) => setSelectedMainCategory(value === "all" ? "" : value)}
                  >
                    <SelectTrigger className="bg-white dark:bg-gray-900 shadow-sm border-gray-300 dark:border-gray-700">
                      <SelectValue placeholder="Alt Kategori Seçin" className="font-medium" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="font-medium">Bütün Alt Kategoriyalar</SelectItem>
                      {mainCategories.map(category => (
                        <SelectItem key={category.id} value={category.id} className="font-medium">
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-3">
                <Label className="text-foreground">Məkan</Label>
                <Select 
                  value={selectedLocation || "all"} 
                  onValueChange={(value) => setSelectedLocation(value === "all" ? "" : value)}
                >
                  <SelectTrigger className="bg-white dark:bg-gray-900 shadow-sm border-gray-300 dark:border-gray-700">
                    <SelectValue placeholder="Konum Seçin" className="font-medium" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="font-medium">Bütün Məkanlar</SelectItem>
                    {locations.map(location => (
                      <SelectItem key={location.id} value={location.id} className="font-medium">
                        {location.city}, {location.country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label className="text-foreground">Qiymət Aralığı</Label>
                <div className="flex gap-4 items-center">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-1/2"
                  />
                  <span className="text-foreground">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-1/2"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="text-foreground">Məhsulun vəziyyəti</Label>
                <Select
                  value={isNew === null ? 'all' : isNew === true ? 'new' : 'old'}
                  onValueChange={value => {
                    if (value === 'all') setIsNew(null);
                    else if (value === 'new') setIsNew(true);
                    else setIsNew(false);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Hamısı</SelectItem>
                    <SelectItem value="new">Yalnız Yeni</SelectItem>
                    <SelectItem value="old">Yalnız Köhnə</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-foreground">VİP Elan</Label>
                <Select
                  value={isFeatured === null ? 'all' : isFeatured === true ? 'featured' : 'notfeatured'}
                  onValueChange={value => {
                    if (value === 'all') setIsFeatured(null);
                    else if (value === 'featured') setIsFeatured(true);
                    else setIsFeatured(false);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Hamısı</SelectItem>
                    <SelectItem value="featured">Yalnız VİP</SelectItem>
                    <SelectItem value="notfeatured">Yalnız Normal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="text-foreground">Sıralama</Label>
                <Select 
                  value={sortBy === 'createdAt' ? (sortDir === 'desc' ? 'createdAt-desc' : 'createdAt-asc') : 
                          sortBy === 'price' ? (sortDir === 'desc' ? 'price-desc' : 'price-asc') : 'createdAt-desc'} 
                  onValueChange={(value) => {
                    const [newSortBy, newSortDir] = value.split('-');
                    setSortBy(newSortBy);
                    setSortDir(newSortDir);
                    // Mobil görünümde hemen fetchAds çağrılmıyor, filtreler uygulandığında çağrılacak
                  }}
                >
                  <SelectTrigger className="bg-white dark:bg-gray-900 shadow-sm border-gray-300 dark:border-gray-700">
                    <SelectValue placeholder="Sıralama Seçin" className="font-medium" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt-desc" className="font-medium">Ən Yeni</SelectItem>
                    <SelectItem value="createdAt-asc" className="font-medium">Ən Köhnə</SelectItem>
                    <SelectItem value="price-asc" className="font-medium">Qiymət (Aşağıdan Yuxarıya)</SelectItem>
                    <SelectItem value="price-desc" className="font-medium">Qiymət (Yuxarıdan Aşağıya)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <SheetFooter className="flex flex-col sm:flex-row gap-3 mt-4">
              <Button variant="outline" className="w-full" onClick={clearFilters}>
                <CircleX className="mr-2 h-4 w-4" /> Filterləri Təmizlə
              </Button>
              <SheetClose asChild>
                <Button className="w-full" onClick={applyFilters}>
                  <Filter className="mr-2 h-4 w-4" /> Filterləri Tətbiq Et
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Aktif filtreler */}
      <div className="flex flex-wrap gap-2 mt-3">
        {searchTerm && (
          <Badge variant="outline" className="flex items-center gap-1 bg-gray-200 dark:bg-gray-700 text-foreground text-sm px-3 py-1">
            Axtarış: {searchTerm}
            <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => {
              setSearchTerm('');
              fetchAds({ searchTerm: '' });
            }} />
          </Badge>
        )}
        
        {selectedCategory && categories.find(c => c.id === selectedCategory) && (
          <Badge variant="outline" className="flex items-center gap-1 bg-gray-200 dark:bg-gray-700 text-foreground text-sm px-3 py-1">
            Kategoriya: {categories.find(c => c.id === selectedCategory).name}
            <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => {
              setSelectedCategory('');
              setSelectedMainCategory('');
              fetchAds({ selectedCategory: '', selectedMainCategory: '' });
            }} />
          </Badge>
        )}
        
        {selectedMainCategory && mainCategories.find(c => c.id === selectedMainCategory) && (
          <Badge variant="outline" className="flex items-center gap-1 bg-gray-200 dark:bg-gray-700 text-foreground text-sm px-3 py-1">
            Alt Kategoriya: {mainCategories.find(c => c.id === selectedMainCategory).name}
            <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => {
              setSelectedMainCategory('');
              fetchAds({ selectedMainCategory: '' });
            }} />
          </Badge>
        )}
        
        {selectedLocation && locations.find(l => l.id === selectedLocation) && (
          <Badge variant="outline" className="flex items-center gap-1 bg-gray-200 dark:bg-gray-700 text-foreground text-sm px-3 py-1">
            Məkan: {locations.find(l => l.id === selectedLocation).city}, {locations.find(l => l.id === selectedLocation).country}
            <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => {
              setSelectedLocation('');
              fetchAds({ selectedLocation: '' });
            }} />
          </Badge>
        )}
        
        {(minPrice || maxPrice) && (
          <Badge variant="outline" className="flex items-center gap-1 bg-gray-200 dark:bg-gray-700 text-foreground text-sm px-3 py-1">
            Qiymət: {minPrice || '0'} AZN - {maxPrice || '∞'} AZN
            <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => {
              setMinPrice('');
              setMaxPrice('');
              fetchAds({ minPrice: '', maxPrice: '' });
            }} />
          </Badge>
        )}
        
        {isNew !== null && (
          <Badge variant="outline" className="flex items-center gap-1 bg-gray-200 dark:bg-gray-700 text-foreground text-sm px-3 py-1">
            {isNew === true ? 'Sadəcə Yeni Məhsullar' : 'Sadəcə Köhnə Məhsullar'}
            <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => {
              setIsNew(null);
              fetchAds({ isNew: null });
            }} />
          </Badge>
        )}
        
        {isFeatured !== null && (
          <Badge variant="outline" className="flex items-center gap-1 bg-gray-200 dark:bg-gray-700 text-foreground text-sm px-3 py-1">
            {isFeatured === true ? 'Sadece VİP Elanlar' : 'Sadece Normal Elanlar'}
            <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => {
              setIsFeatured(null);
              fetchAds({ isFeatured: null });
            }} />
          </Badge>
        )}
      </div>

      {/* Öne Çıkan İlanlar */}
      {!isFeaturedLoading && featuredAds.length > 0 && isFeatured === null && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <CirclePlus className="h-5 w-5 text-primary" /> VİP Elanlar
            </h2>
          </div>
          
          {isFeaturedLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : featuredError ? (
            <Card className="bg-destructive/10 border-destructive/20">
              <CardContent className="p-4 text-center text-destructive">
                {featuredError}
              </CardContent>
            </Card>
          ) : featuredAds.length === 0 ? (
            <Card>
              <CardContent className="p-4 text-center text-muted-foreground">
               VİP elan tapılmadı.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredAds.map(ad => (
                <AdCard 
                  key={ad.id} 
                  ad={ad} 
                  isFavorite={favoriteAds.includes(ad.id)}
                  onFavoriteToggle={() => handleFavoriteToggle(ad.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Normal İlanlar */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="p-6 text-center text-destructive">
            {error}
          </CardContent>
        </Card>
      ) : ads.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="p-12 text-center">
            <div className="flex flex-col items-center justify-center gap-4">
              <CircleX className="h-16 w-16 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-medium text-foreground mb-1">Nəticə Tapılmadı</h3>
                <p className="text-muted-foreground">
                Axtarış meyarlarınıza uyğun heç bir elan tapılmadı. Filtrləri dəyişdirin və yenidən cəhd edin.
                </p>
              </div>
              <Button onClick={clearFilters} variant="outline" className="mt-2">
                Filterləri Təmizlə
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {ads.map(ad => (
              <AdCard 
                key={ad.id} 
                ad={ad} 
                isFavorite={favoriteAds.includes(ad.id)}
                onFavoriteToggle={() => handleFavoriteToggle(ad.id)}
              />
            ))}
          </div>
          
          {/* Sayfalama */}
          {totalPages > 1 && (
            <Pagination
              totalItems={totalCount}
              pageSize={pageSize}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              className="mt-8"
            />
          )}
        </div>
      )}
    </div>
  );
}

export default AdsList; 