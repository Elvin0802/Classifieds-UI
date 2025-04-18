import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaUser, FaCalendar, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaFlag, FaHeart, FaRegHeart, FaArrowLeft, FaTag, FaChevronRight, FaStar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import adService from '../../services/adService';
import reportService from '../../services/reportService';
import AdCard from '../../components/ad/AdCard';

function AdDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ad, setAd] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [sellerAds, setSellerAds] = useState([]);
  const [isLoadingSellerAds, setIsLoadingSellerAds] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [pricingOptions, setPricingOptions] = useState([]);
  const [isLoadingPricingOptions, setIsLoadingPricingOptions] = useState(false);
  const [selectedPricingOption, setSelectedPricingOption] = useState(null);
  const [isProcessingFeature, setIsProcessingFeature] = useState(false);

  // İlan detaylarını getir
  useEffect(() => {
    const fetchAdDetail = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await adService.getById(id);
        
        if (response && response.isSucceeded && response.data && response.data.item) {
          setAd(response.data.item);
          setIsFavorited(response.data.item.isSelected);
          
          // Satıcının diğer ilanlarını getir
          if (response.data.item.appUser && response.data.item.appUser.id) {
            fetchSellerAds(response.data.item.appUser.id);
          }
        } else {
          setError('İlan detayları alınırken bir hata oluştu');
        }
      } catch (err) {
        console.error('İlan detayları yüklenirken hata oluştu:', err);
        setError('İlan detayları yüklenemedi. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchAdDetail();
    }
  }, [id]);
  
  // Satıcının diğer ilanlarını getir
  const fetchSellerAds = async (userId) => {
    setIsLoadingSellerAds(true);
    
    try {
      const response = await adService.getUserAds(userId, { 
        pageSize: 4,
        excludeId: id
      });
      
      if (response && response.isSucceeded && response.data && response.data.items) {
        setSellerAds(response.data.items.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error('Satıcının diğer ilanları yüklenirken hata oluştu:', err);
    } finally {
      setIsLoadingSellerAds(false);
    }
  };

  // Favorilere ekle/çıkar
  const handleToggleFavorite = async () => {
    try {
      if (isFavorited) {
        await adService.unselectAd(id);
        setIsFavorited(false);
        toast.success('İlan favorilerden çıkarıldı');
      } else {
        await adService.selectAd(id);
        setIsFavorited(true);
        toast.success('İlan favorilere eklendi');
      }
    } catch (err) {
      console.error('Favori işlemi sırasında hata oluştu:', err);
      toast.error('İşlem sırasında bir hata oluştu');
    }
  };

  // İlanı bildir
  const handleReportAd = async () => {
    if (!reportReason.trim()) {
      toast.error('Lütfen bildirim sebebini belirtin');
      return;
    }
    
    try {
      const reportData = {
        adId: id,
        reason: 'OTHER', // Sabit bir değer olarak 'OTHER' kullanıyoruz
        description: reportReason
      };
      
      const response = await reportService.createReport(reportData);
      
      if (response && response.isSucceeded) {
        toast.success('İlan başarıyla bildirildi');
        setShowReportModal(false);
        setReportReason('');
      } else {
        toast.error(response?.message || 'İlan bildirme işlemi başarısız oldu');
      }
    } catch (err) {
      console.error('İlan bildirilirken hata oluştu:', err);
      toast.error('İşlem sırasında bir hata oluştu');
    }
  };

  // Fiyat formatı
  const formatPrice = (price) => {
    if (price === undefined || price === null) return 'Belirtilmemiş';
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Tarih formatı
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Sonraki resme geç
  const nextImage = () => {
    if (ad.images && ad.images.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === ad.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  // Önceki resme geç
  const prevImage = () => {
    if (ad.images && ad.images.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? ad.images.length - 1 : prevIndex - 1
      );
    }
  };

  // Fiyatlandırma seçeneklerini getir
  const fetchPricingOptions = async () => {
    setIsLoadingPricingOptions(true);
    
    try {
      const response = await adService.getPricingOptions();
      
      if (response && response.isSucceeded && response.data) {
        setPricingOptions(response.data.items || []);
      } else {
        toast.error('Fiyatlandırma seçenekleri yüklenemedi');
      }
    } catch (err) {
      console.error('Fiyatlandırma seçenekleri yüklenirken hata oluştu:', err);
      toast.error('Fiyatlandırma seçenekleri yüklenemedi');
    } finally {
      setIsLoadingPricingOptions(false);
    }
  };

  // İlanı öne çıkar
  const handleFeatureAd = async () => {
    if (!selectedPricingOption) {
      toast.error('Lütfen bir fiyatlandırma seçeneği seçin');
      return;
    }
    
    setIsProcessingFeature(true);
    
    try {
      const response = await adService.featureAd(id, selectedPricingOption.durationDays);
      
      if (response && response.isSucceeded) {
        toast.success('İlan başarıyla öne çıkarıldı');
        setShowFeatureModal(false);
        setSelectedPricingOption(null);
        
        // İlan detaylarını yeniden yükle
        const adResponse = await adService.getById(id);
        if (adResponse && adResponse.isSucceeded && adResponse.data && adResponse.data.item) {
          setAd(adResponse.data.item);
        }
      } else {
        toast.error(response?.message || 'İlan öne çıkarılamadı');
      }
    } catch (err) {
      console.error('İlan öne çıkarılırken hata oluştu:', err);
      toast.error('İşlem sırasında bir hata oluştu');
    } finally {
      setIsProcessingFeature(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !ad) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">{error || 'İlan bulunamadı'}</p>
          <p className="mt-2">
            <Link to="/ilanlar" className="text-red-700 underline">
              İlanlar sayfasına dön
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex py-3 px-4 text-sm bg-gray-50 rounded-lg mb-6">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link to="/" className="text-gray-700 hover:text-primary">Ana Sayfa</Link>
          </li>
          <li>
            <div className="flex items-center">
              <FaChevronRight className="text-gray-400 mx-1" />
              <Link to="/ilanlar" className="text-gray-700 hover:text-primary">İlanlar</Link>
            </div>
          </li>
          {ad.category && (
            <li>
              <div className="flex items-center">
                <FaChevronRight className="text-gray-400 mx-1" />
                <Link 
                  to={`/ilanlar?categoryId=${ad.category.id}`} 
                  className="text-gray-700 hover:text-primary"
                >
                  {ad.category.name}
                </Link>
              </div>
            </li>
          )}
          {ad.mainCategory && (
            <li>
              <div className="flex items-center">
                <FaChevronRight className="text-gray-400 mx-1" />
                <Link 
                  to={`/ilanlar?mainCategoryId=${ad.mainCategory.id}`} 
                  className="text-gray-700 hover:text-primary"
                >
                  {ad.mainCategory.name}
                </Link>
              </div>
            </li>
          )}
          <li>
            <div className="flex items-center">
              <FaChevronRight className="text-gray-400 mx-1" />
              <span className="text-gray-500">{ad.title}</span>
            </div>
          </li>
        </ol>
      </nav>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Kolon: Resimler ve Detaylar */}
        <div className="lg:col-span-2">
          {/* İlan Resimleri */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="relative">
              {ad.images && ad.images.length > 0 ? (
                <>
                  <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                    <img 
                      src={ad.images[currentImageIndex].url} 
                      alt={ad.title} 
                      className="object-contain w-full h-full"
                    />
                  </div>
                  
                  {ad.images.length > 1 && (
                    <>
                      <button 
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md"
                      >
                        <FaArrowLeft />
                      </button>
                      <button 
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md"
                      >
                        <FaChevronRight />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="aspect-w-16 aspect-h-9 bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400">Resim yok</span>
                </div>
              )}
            </div>
            
            {/* Küçük Resimler */}
            {ad.images && ad.images.length > 1 && (
              <div className="flex overflow-x-auto p-2 gap-2">
                {ad.images.map((image, index) => (
                  <img 
                    key={index}
                    src={image.url}
                    alt={`${ad.title} - Resim ${index + 1}`}
                    className={`h-20 w-20 object-cover cursor-pointer border-2 ${
                      currentImageIndex === index 
                        ? 'border-primary' 
                        : 'border-transparent'
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* İlan Detayları */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex flex-wrap justify-between items-start mb-4">
                <h1 className="text-2xl font-bold text-gray-800 mr-2">{ad.title}</h1>
                {ad.isFeatured && (
                  <span className="bg-yellow-400 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">
                    Öne Çıkan
                  </span>
                )}
              </div>
              
              <h2 className="text-3xl font-bold text-primary mb-6">
                {formatPrice(ad.price)}
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-500">İlan Tarihi</span>
                  <span className="font-medium">{formatDate(ad.createdAt)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">İlan No</span>
                  <span className="font-medium">{ad.id.substring(0, 8)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Görüntülenme</span>
                  <span className="font-medium">{ad.viewCount || 0}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Durum</span>
                  <span className="font-medium">{ad.isNew ? 'Yeni' : 'İkinci El'}</span>
                </div>
              </div>
              
              <hr className="my-6" />
              
              <h3 className="text-xl font-semibold mb-4">İlan Açıklaması</h3>
              <div className="prose max-w-none mb-6">
                <p className="whitespace-pre-line">{ad.description}</p>
              </div>
              
              <hr className="my-6" />
              
              <h3 className="text-xl font-semibold mb-4">Özellikler</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {ad.category && (
                  <div className="flex items-center">
                    <FaTag className="text-gray-400 mr-2" />
                    <div>
                      <span className="text-gray-500 text-sm">Kategori:</span>
                      <span className="ml-2 font-medium">{ad.category.name}</span>
                    </div>
                  </div>
                )}
                
                {ad.mainCategory && (
                  <div className="flex items-center">
                    <FaTag className="text-gray-400 mr-2" />
                    <div>
                      <span className="text-gray-500 text-sm">Alt Kategori:</span>
                      <span className="ml-2 font-medium">{ad.mainCategory.name}</span>
                    </div>
                  </div>
                )}
                
                {ad.location && (
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="text-gray-400 mr-2" />
                    <div>
                      <span className="text-gray-500 text-sm">Konum:</span>
                      <span className="ml-2 font-medium">{ad.location.city}, {ad.location.country}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Alt Kategori Değerleri */}
              {ad.adSubCategoryValues && ad.adSubCategoryValues.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-lg font-medium mb-2">Ek Özellikler</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {ad.adSubCategoryValues.map((subCatValue) => (
                      <div key={subCatValue.id} className="flex items-start">
                        <FaTag className="text-gray-400 mr-2 mt-1" />
                        <div>
                          <span className="text-gray-500 text-sm">
                            {ad.mainCategory?.subCategories?.find(
                              sc => sc.id === subCatValue.subCategoryId
                            )?.name || 'Özellik'}:
                          </span>
                          <span className="ml-2 font-medium">{subCatValue.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <hr className="my-6" />
              
              {/* Aksiyon Butonları */}
              <div className="flex flex-wrap gap-3">
                <button 
                  className={`btn ${isFavorited ? 'btn-error' : 'btn-outline'}`}
                  onClick={handleToggleFavorite}
                >
                  {isFavorited ? (
                    <><FaHeart className="mr-2" /> Favorilerden Çıkar</>
                  ) : (
                    <><FaRegHeart className="mr-2" /> Favorilere Ekle</>
                  )}
                </button>
                <button 
                  className="btn btn-outline"
                  onClick={() => setShowReportModal(true)}
                >
                  <FaFlag className="mr-2" /> İlanı Bildir
                </button>
                {!ad.isFeatured && ad.appUser && ad.appUser.isCurrentUser && (
                  <button 
                    className="btn btn-warning"
                    onClick={() => {
                      fetchPricingOptions();
                      setShowFeatureModal(true);
                    }}
                  >
                    <FaStar className="mr-2" /> VIP Yap
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Satıcının Diğer İlanları */}
          {sellerAds.length > 0 && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">Satıcının Diğer İlanları</h3>
                
                {isLoadingSellerAds ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {sellerAds.map(sellerAd => (
                      <div key={sellerAd.id} className="col-span-1">
                        <AdCard ad={sellerAd} />
                      </div>
                    ))}
                  </div>
                )}
                
                {sellerAds.length > 0 && ad.appUser && (
                  <div className="mt-4 text-center">
                    <Link 
                      to={`/ilanlar?searchedAppUserId=${ad.appUser.id}`}
                      className="btn btn-outline btn-wide"
                    >
                      Tüm İlanları Gör
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Sağ Kolon: Satıcı Bilgileri ve İletişim */}
        <div className="lg:col-span-1">
          {/* Satıcı Bilgileri */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">Satıcı Bilgileri</h3>
              
              {ad.appUser ? (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                      <FaUser className="text-gray-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">{ad.appUser.name}</h4>
                      <p className="text-sm text-gray-500">
                        Üyelik: {formatDate(ad.appUser.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  <hr />
                  
                  {/* İletişim Bilgileri */}
                  <div>
                    {showContactInfo ? (
                      <div className="space-y-3">
                        {ad.appUser.phoneNumber && (
                          <div className="flex items-center">
                            <FaPhoneAlt className="text-primary mr-3" />
                            <div>
                              <span className="text-gray-500 text-sm">Telefon:</span>
                              <a 
                                href={`tel:${ad.appUser.phoneNumber}`} 
                                className="block font-medium"
                              >
                                {ad.appUser.phoneNumber}
                              </a>
                            </div>
                          </div>
                        )}
                        
                        {ad.appUser.email && (
                          <div className="flex items-center">
                            <FaEnvelope className="text-primary mr-3" />
                            <div>
                              <span className="text-gray-500 text-sm">E-posta:</span>
                              <a 
                                href={`mailto:${ad.appUser.email}`} 
                                className="block font-medium"
                              >
                                {ad.appUser.email}
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <button 
                        className="btn btn-primary w-full"
                        onClick={() => setShowContactInfo(true)}
                      >
                        İletişim Bilgilerini Göster
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Satıcı bilgileri bulunamadı.</p>
              )}
            </div>
          </div>
          
          {/* Güvenlik İpuçları */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">Güvenlik İpuçları</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full mr-2 mt-1.5"></span>
                  Satıcıyla yüz yüze görüşme ayarlarken güvenli ve halka açık bir yer seçin
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full mr-2 mt-1.5"></span>
                  Ürünü görmeden para transferi yapmaktan kaçının
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full mr-2 mt-1.5"></span>
                  Ürünün durumunu, çalışıp çalışmadığını kontrol edin
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full mr-2 mt-1.5"></span>
                  Şüpheli durumlarda ödeme yapmaktan kaçının
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Öne Çıkarma (VIP) Modalı */}
      {showFeatureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">İlanınızı Öne Çıkarın</h3>
              <p className="text-gray-600 mb-4">
                İlanınızı öne çıkararak daha fazla kişiye ulaşabilirsiniz. Aşağıdaki seçeneklerden birini seçin.
              </p>
              
              {isLoadingPricingOptions ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-3 my-4">
                  {pricingOptions.length > 0 ? (
                    pricingOptions.map((option) => (
                      <label key={option.id} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="pricingOption"
                          className="radio radio-primary mr-3"
                          checked={selectedPricingOption?.id === option.id}
                          onChange={() => setSelectedPricingOption(option)}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{option.name}</p>
                          <p className="text-sm text-gray-600">{option.durationDays} gün boyunca öne çıkar</p>
                        </div>
                        <div className="text-lg font-bold text-primary">
                          {new Intl.NumberFormat('tr-TR', {
                            style: 'currency',
                            currency: 'TRY',
                            minimumFractionDigits: 0
                          }).format(option.price)}
                        </div>
                      </label>
                    ))
                  ) : (
                    <p className="text-center text-gray-500">Fiyatlandırma seçeneği bulunamadı</p>
                  )}
                </div>
              )}
              
              <div className="flex justify-end gap-2 mt-4">
                <button 
                  className="btn btn-ghost"
                  onClick={() => {
                    setShowFeatureModal(false);
                    setSelectedPricingOption(null);
                  }}
                  disabled={isProcessingFeature}
                >
                  İptal
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleFeatureAd}
                  disabled={!selectedPricingOption || isProcessingFeature}
                >
                  {isProcessingFeature ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      İşleniyor...
                    </>
                  ) : (
                    "VIP Yap"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* İlan Bildirim Modalı */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">İlanı Bildir</h3>
              <p className="text-gray-600 mb-4">
                Lütfen bu ilanı neden bildirdiğinizi açıklayın. Bildiriminiz incelenecektir.
              </p>
              <textarea
                className="w-full border rounded-lg p-3 min-h-[120px]"
                placeholder="Bildirim nedeninizi açıklayın..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              ></textarea>
              
              <div className="flex justify-end gap-2 mt-4">
                <button 
                  className="btn btn-ghost"
                  onClick={() => {
                    setShowReportModal(false);
                    setReportReason('');
                  }}
                >
                  İptal
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleReportAd}
                >
                  Bildir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdDetail; 