import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adService, profileService } from '../services';
import categoryService from '../services/categoryService';
import locationService from '../services/locationService';
import { Loading, VipAdPreview } from '../components/ui';
import { FaSearch, FaArrowRight, FaMapMarkerAlt, FaListUl, FaChevronDown } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [ads, setAds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMainCategory, setSelectedMainCategory] = useState('');
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategoryValues, setSubCategoryValues] = useState({});
  const [favoriteAds, setFavoriteAds] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // İlanları yükleme - API'den sadece featured olanları getir
        const adsResponse = await adService.getAllAds({ isFeatured: true });
        const loadedAds = adsResponse?.items || [];
        setAds(loadedAds);

        // Kategorileri yükleme
        const catResponse = await categoryService.getAllCategories();
        setCategories(catResponse?.items || []);

        // Ana kategorileri yükleme
        const mainCatResponse = await categoryService.getAllMainCategories();
        setMainCategories(mainCatResponse?.items || []);

        // Lokasyonları yükleme
        const locResponse = await locationService.getAllLocations();
        setLocations(locResponse?.items || []);

        setLoading(false);
      } catch (err) {
        console.error('Veri yüklenirken hata:', err);
        setError('Veriler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  // Kategori seçildiğinde ana kategorileri getir
  useEffect(() => {
    const fetchMainCategories = async () => {
      if (!selectedCategory) {
        setMainCategories([]);
        setSelectedMainCategory('');
        return;
      }
      
      try {
        const response = await categoryService.getCategoryById(selectedCategory);
        if (response && response.categoryDto && response.categoryDto.mainCategories) {
          setMainCategories(response.categoryDto.mainCategories);
        } else {
          setMainCategories([]);
        }
        // Ana kategori seçimini sıfırla
        setSelectedMainCategory('');
        // Alt kategori değerlerini sıfırla
        setSubCategoryValues({});
      } catch (err) {
        console.error('Ana kategoriler yüklenirken hata:', err);
        setMainCategories([]);
      }
    };
    
    fetchMainCategories();
  }, [selectedCategory]);

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Arama parametrelerini oluştur
    const searchParams = new URLSearchParams();
    
    if (searchTerm && searchTerm.trim() !== '') {
      searchParams.append('searchTerm', searchTerm);
    }
    
    if (selectedLocation && selectedLocation !== '') {
      searchParams.append('locationId', selectedLocation);
    }
    
    if (selectedCategory && selectedCategory !== '') {
      searchParams.append('categoryId', selectedCategory);
    }
    
    if (selectedMainCategory && selectedMainCategory !== '') {
      searchParams.append('mainCategoryId', selectedMainCategory);
    }
    
    // Alt kategori değerleri varsa ekle
    if (Object.keys(subCategoryValues).length > 0) {
      searchParams.append('subCategoryValues', JSON.stringify(subCategoryValues));
    }
    
    // İlanlar sayfasına yönlendir
    navigate(`/ads?${searchParams.toString()}`);
  };

  // Alt kategori değerlerini güncelle
  const handleSubCategoryChange = (key, value) => {
    setSubCategoryValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Rastgele bir renk seçmek için yardımcı fonksiyon
  const getRandomColor = () => {
    const colors = [
      'bg-blue-100 hover:bg-blue-200',
      'bg-green-100 hover:bg-green-200',
      'bg-yellow-100 hover:bg-yellow-200',
      'bg-red-100 hover:bg-red-200',
      'bg-purple-100 hover:bg-purple-200',
      'bg-indigo-100 hover:bg-indigo-200',
      'bg-pink-100 hover:bg-pink-200'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
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

  // İlanları görüntüleme
  const renderAds = () => {
    if (loading) {
      return <Loading />;
    }

    if (!ads || ads.length === 0) {
      return <p className="text-center py-4">Gösterilecek ilan bulunamadı.</p>;
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {ads.map((ad) => (
          <Link to={`/ads/${ad.id}`} key={ad.id} className="block hover:no-underline">
            <VipAdPreview
              imageUrl={ad.mainImageUrl || (ad.images && ad.images.length > 0 ? ad.images[0].url : null)}
              title={ad.title}
              location={ad.location?.city || ad.locationCityName}
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
    );
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-danger mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="btn btn-primary"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary text-white py-20 px-4 rounded-lg mb-10">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">İhtiyacınız Olan Her Şey Burada</h1>
          <p className="text-xl mb-10">
            Binlerce ilan arasında aradığınızı kolayca bulun veya kendi ilanınızı hemen yayınlayın.
          </p>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <FaSearch />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ne aramıştınız?"
                  className="input rounded-md w-full pl-10 focus:ring-2 focus:ring-primary focus:border-primary text-gray-800"
                />
              </div>
              
              <div className="flex-1 relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input rounded-md w-full appearance-none pl-10 pr-10 focus:ring-2 focus:ring-primary focus:border-primary text-gray-800"
                >
                  <option value="">Tüm Kategoriler</option>
                  {categories && categories.length > 0 ? (
                    categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Kategori yükleniyor...</option>
                  )}
                </select>
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <FaListUl />
                </div>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <FaChevronDown />
                </div>
              </div>
              
              {selectedCategory && (
                <div className="flex-1 relative">
                  <select
                    value={selectedMainCategory}
                    onChange={(e) => setSelectedMainCategory(e.target.value)}
                    className="input rounded-md w-full appearance-none pl-10 pr-10 focus:ring-2 focus:ring-primary focus:border-primary text-gray-800"
                  >
                    <option value="">Tüm Alt Kategoriler</option>
                    {mainCategories && mainCategories.length > 0 ? (
                      mainCategories.map(mainCategory => (
                        <option key={mainCategory.id} value={mainCategory.id}>
                          {mainCategory.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>Alt kategori yükleniyor...</option>
                    )}
                  </select>
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <FaListUl />
                  </div>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <FaChevronDown />
                  </div>
                </div>
              )}
              
              <div className="flex-1 relative">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="input rounded-md w-full appearance-none pl-10 pr-10 focus:ring-2 focus:ring-primary focus:border-primary text-gray-800"
                >
                  <option value="">Tüm Konumlar</option>
                  {locations && locations.length > 0 ? (
                    locations.map(location => (
                      <option key={location.id} value={location.id}>
                        {location.city}, {location.country}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Konum yükleniyor...</option>
                  )}
                </select>
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <FaMapMarkerAlt />
                </div>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <FaChevronDown />
                </div>
              </div>
              
              <button 
                type="submit" 
                className="btn btn-danger flex items-center justify-center min-w-[120px] py-3 px-6"
              >
                <FaSearch className="mr-2" /> Ara
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Featured Ads Section */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Öne Çıkan İlanlar</h2>
            <Link to="/ads" className="flex items-center text-primary hover:underline">
              Tüm İlanları Gör <FaArrowRight className="ml-2" />
            </Link>
          </div>

          {renderAds()}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Popüler Kategoriler</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.slice(0, 8).map((category) => (
              <Link 
                key={category.id}
                to={`/ads?categoryId=${category.id}`}
                className={`p-4 rounded-lg ${getRandomColor()} text-center transition-all hover:shadow-md`}
              >
                <h3 className="font-medium">{category.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {category.mainCategories?.length || 0} alt kategori
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Locations Section */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Popüler Şehirler</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {locations.slice(0, 8).map((location) => (
              <Link 
                key={location.id}
                to={`/ads?locationId=${location.id}`}
                className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FaMapMarkerAlt className="text-primary mr-2" />
                <span>{location.city}, {location.country}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Hemen İlanınızı Verin</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Binlerce kullanıcıya ulaşmak ve satışlarınızı artırmak için hemen ücretsiz ilan verin.
          </p>
          <Link 
            to="/create-ad"
            className="inline-block px-6 py-3 bg-white text-primary font-medium rounded-md hover:bg-gray-100 transition"
          >
            İlan Ver
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 