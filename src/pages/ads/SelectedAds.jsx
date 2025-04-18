import React, { useState, useEffect } from 'react';
import { FaStar, FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import profileService from '../../services/profileService';

const SelectedAds = () => {
  // State tanımlamaları
  const [loading, setLoading] = useState(true);
  const [ads, setAds] = useState([]);
  const [error, setError] = useState('');
  const [paginationInfo, setPaginationInfo] = useState({
    pageNumber: 1,
    pageSize: 12,
    totalCount: 0,
    totalPages: 0
  });
  const [searchParams, setSearchParams] = useState({
    pageNumber: 1,
    pageSize: 12,
    keyword: ''
  });

  // İlanları getir
  useEffect(() => {
    const fetchSelectedAds = async () => {
      try {
        setLoading(true);
        const response = await profileService.getSelectedAds(searchParams);
        
        if (response.isSucceeded && response.data) {
          setAds(response.data.items || []);
          setPaginationInfo({
            pageNumber: response.data.pageNumber || 1,
            pageSize: response.data.pageSize || 12,
            totalCount: response.data.totalCount || 0,
            totalPages: response.data.totalPages || 0
          });
        } else {
          setAds([]);
          setError('Seçilmiş ilanlar alınamadı');
        }
      } catch (error) {
        console.error('Seçilmiş ilanlar alınırken hata:', error);
        setError('Seçilmiş ilanlar alınırken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchSelectedAds();
  }, [searchParams]);

  // Arama parametrelerini güncelleme
  const handleSearch = (e) => {
    e.preventDefault();
    // Arama yapıldığında sayfa numarasını 1'e sıfırla
    setSearchParams(prev => ({
      ...prev,
      pageNumber: 1
    }));
  };

  // Input değişikliklerini takip etme
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Sayfa değiştirme
  const handlePageChange = (pageNumber) => {
    setSearchParams(prev => ({
      ...prev,
      pageNumber
    }));
  };

  // Sayfalama
  const renderPagination = () => {
    const items = [];
    for (let i = 1; i <= paginationInfo.totalPages; i++) {
      items.push(
        <button
          key={i}
          className={`px-3 py-1 mx-1 rounded ${i === paginationInfo.pageNumber 
            ? 'bg-blue-600 text-white' 
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex justify-center mt-6">
        <button
          className={`px-3 py-1 mx-1 rounded flex items-center ${paginationInfo.pageNumber === 1 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
          onClick={() => paginationInfo.pageNumber > 1 && handlePageChange(paginationInfo.pageNumber - 1)}
          disabled={paginationInfo.pageNumber === 1}
        >
          <FaChevronLeft className="mr-1" /> Önceki
        </button>
        {items}
        <button
          className={`px-3 py-1 mx-1 rounded flex items-center ${paginationInfo.pageNumber === paginationInfo.totalPages 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
          onClick={() => paginationInfo.pageNumber < paginationInfo.totalPages && handlePageChange(paginationInfo.pageNumber + 1)}
          disabled={paginationInfo.pageNumber === paginationInfo.totalPages}
        >
          Sonraki <FaChevronRight className="ml-1" />
        </button>
      </div>
    );
  };

  if (loading && ads.length === 0) {
    return (
      <div className="container mx-auto py-5 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-3">Seçilmiş ilanlar yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 px-4">
      <h2 className="mb-4 flex items-center text-2xl font-bold">
        <FaStar className="text-yellow-500 mr-2" /> Seçilmiş İlanlar
      </h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Arama Formu */}
      <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
        <div className="p-4">
          <form onSubmit={handleSearch}>
            <div className="grid md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-3">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  <FaSearch className="inline mr-1" /> İlan Ara
                </label>
                <input
                  type="text"
                  name="keyword"
                  value={searchParams.keyword}
                  onChange={handleInputChange}
                  placeholder="Anahtar kelime girin..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-1">
                <button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded flex items-center justify-center"
                >
                  <FaSearch className="mr-1" /> Ara
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      {/* İlan Listesi */}
      {ads.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ads.map(ad => (
              <div key={ad.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full">
                <div className="relative">
                  {ad.mainImageUrl ? (
                    <img 
                      src={ad.mainImageUrl} 
                      alt={ad.title}
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="h-48 w-full bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400">Resim Yok</span>
                    </div>
                  )}
                  <div className="absolute top-0 right-0 m-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <FaStar className="mr-1" /> Seçilmiş İlan
                    </span>
                  </div>
                </div>
                <div className="p-4 flex-grow">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{ad.title}</h3>
                  <p className="text-gray-900 font-bold mb-2">
                    {ad.price.toLocaleString('tr-TR')} ₺
                  </p>
                  <p className="text-gray-500 text-sm">
                    {ad.locationCityName && <span>{ad.locationCityName}</span>}
                    {ad.updatedAt && (
                      <span className="ml-2">
                        {new Date(ad.updatedAt).toLocaleDateString('tr-TR')}
                      </span>
                    )}
                  </p>
                </div>
                <div className="p-4 border-t border-gray-200">
                  <Link 
                    to={`/ads/${ad.id}`} 
                    className="w-full block text-center bg-white hover:bg-gray-50 text-blue-600 border border-blue-600 font-medium py-2 px-4 rounded transition-colors"
                  >
                    İlanı Görüntüle
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          {/* Sayfalama */}
          {paginationInfo.totalPages > 1 && renderPagination()}
        </>
      ) : (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          Seçilmiş ilan bulunamadı.
        </div>
      )}
    </div>
  );
};

export default SelectedAds; 