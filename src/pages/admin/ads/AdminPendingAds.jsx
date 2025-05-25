import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSpinner, FaSearch, FaExclamationCircle, FaClock } from 'react-icons/fa';
import adService from '../../../services/adService';
import { toast } from 'react-toastify';

const AdminPendingAds = () => {
  const [pendingAds, setPendingAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const pageSize = 24;

  // Bekleyen ilanları getir
  const fetchPendingAds = async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        pageNumber: page,
        pageSize: pageSize,
        sortBy: null,
        isDescending: true,
        searchTitle: searchTerm || null,
        isFeatured: false,
        minPrice: null,
        maxPrice: null,
        categoryId: null,
        mainCategoryId: null,
        locationId: null,
        currentAppUserId: null,
        searchedAppUserId: null,
        adStatus: 0, // 0: Beklemede (Pending)
        subCategoryValues: null
      };
      
      const response = await adService.getAll(params);
      
      if (response && response.isSucceeded && response.data) {
        setPendingAds(response.data.items || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalCount(response.data.totalCount || 0);
      } else {
        setError('Elanları yükləyərkən xəta baş verdi.');
      }
    } catch (err) {
      console.error('Bekleyen ilanlar yüklenirken hata:', err);
      setError('Elanları yükləyərkən xəta baş verdi.');
    } finally {
      setLoading(false);
    }
  };

  // İlan durumunu göster
  const getStatusBadge = (status) => {
    switch (status) {
      case 0:
        return <span className="badge badge-warning">Gözləyir</span>;
      case 1:
        return <span className="badge badge-success">Aktiv</span>;
      case 2:
        return <span className="badge badge-error">Müddəti bitib</span>;
      case 3:
        return <span className="badge badge-info">İmtina edilib</span>;
      default:
        return <span className="badge">Naməlum status</span>;
    }
  };
  
  // Fiyat formatlama
  const formatPrice = (price) => {
    return new Intl.NumberFormat('az-AZ', {
      style: 'currency',
      currency: 'AZN',
      minimumFractionDigits: 0,
    }).format(price);
  };
  
  // Tarih formatlama
  const formatDate = (dateString) => {
    // Null, undefined veya geçersiz değer kontrolü
    if (!dateString) {
      return "Tarih seçilməyib";
    }
    
    try {
      const date = new Date(dateString);
      
      // Geçersiz tarih kontrolü
      if (isNaN(date.getTime())) {
        return "tarih uyğunsuzdur.";
      }
      
      return new Intl.DateTimeFormat('az-AZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error("Tarih formatlama hatası:", error);
      return "Tarix düzəltilmədi";
    }
  };

  // Sayfa değiştiğinde veya arama yapıldığında ilanları yeniden yükle
  useEffect(() => {
    fetchPendingAds(currentPage);
  }, [currentPage]);

  // Arama işlemi
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPendingAds(1);
  };
  
  // Sayfa değiştirme
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">
            <FaClock className="inline mr-2 text-orange-500" />
            Gözləyən Elanlar
          </h1>
          <p className="text-gray-600">{totalCount} gözləyən elan tapıldı</p>
        </div>
        
        {/* Arama kutusu */}
        <form onSubmit={handleSearch} className="mt-4 md:mt-0 w-full md:w-auto">
          <div className="flex items-center">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="İlan ara..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="absolute left-3 top-2.5 text-gray-400">
                <FaSearch />
              </span>
            </div>
            <button
              type="submit"
              className="ml-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              Axtar
            </button>
          </div>
        </form>
      </div>
      
      {/* Hata mesajı */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <div className="flex items-center">
            <FaExclamationCircle className="mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}
      
      {/* Yükleniyor */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <FaSpinner className="animate-spin text-4xl text-primary" />
        </div>
      ) : (
        <>
          {/* İlanlar listesi */}
          {pendingAds.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <FaExclamationCircle className="mx-auto text-gray-400 text-5xl mb-4" />
              <h3 className="text-xl font-medium text-gray-500">Gözləyən Elan tapılmadı</h3>
              <p className="text-gray-400 mt-2">Hazırda gözlənilən Elan yoxdur.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pendingAds.map((ad) => (
                <Link to={`/ads/${ad.id}`} key={ad.id} className="group">
                  <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 overflow-hidden flex flex-col h-full">
                    {/* İlan resmi */}
                    <div className="relative h-48 bg-gray-100">
                      {ad.mainImageUrl ? (
                        <img
                          src={ad.mainImageUrl}
                          alt={ad.title}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-400">
                          Foto yoxdur.
                        </div>
                      )}
                      {/* Beklemede durumu */}
                      <div className="absolute top-2 right-2">
                        {getStatusBadge(ad.adStatus)}
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col p-4">
                      <h2 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">{ad.title}</h2>
                      <div className="flex items-center text-gray-500 text-sm mb-2">
                        <span className="truncate">
                          {ad.locationCityName || 'Məkan yoxdur'}
                        </span>
                      </div>
                      <div className="text-primary font-bold text-xl mb-2">{formatPrice(ad.price)}</div>
                      <div className="text-xs text-gray-500 mt-auto">
                        Əlavə olunma tarixi: {formatDate(ad.createdAt)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          {/* Sayfalama */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="join">
                <button
                  className="join-item btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  «
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`join-item btn ${currentPage === page ? 'btn-active' : ''}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  className="join-item btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  »
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminPendingAds; 