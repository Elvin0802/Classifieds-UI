import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaUser, FaCalendar, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaFlag, FaHeart, FaRegHeart, FaArrowLeft, FaTag, FaChevronRight, FaStar, FaEye, FaClock, FaComment, FaExclamationCircle, FaEdit, FaCheck, FaTimes, FaSpinner, FaCrown } from 'react-icons/fa';
import { toast } from 'react-toastify';
import adService from '../../services/adService';
import reportService from '../../services/reportService';
import chatService from '../../services/chatService';
import AdCard from '../../components/ad/AdCard';
import FeatureAd from '../../components/ad/FeatureAd';
import ReportModal from '../../components/report/ReportModal';
import { useAuth } from '../../contexts/AuthContext';
import { AdStatus } from '../../services/adService';

function AdDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const [ad, setAd] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [sellerAds, setSellerAds] = useState([]);
  const [isLoadingSellerAds, setIsLoadingSellerAds] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [isCreatingChatRoom, setIsCreatingChatRoom] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);
  const [showStatusOptions, setShowStatusOptions] = useState(false);

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
            fetchSellerAds(response.data.item.appUser.id, response.data.item.id);
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
  const fetchSellerAds = async (userId, currentAdId) => {
    setIsLoadingSellerAds(true);
    
    try {
      const response = await adService.getUserAds(userId, { 
        pageSize: 4,
        adStatus: 1
      });
      
      if (response && response.isSucceeded && response.data && response.data.items) {
        // Şu anki ilanı filtreleyerek diğer ilanları göster
        setSellerAds(response.data.items.filter(item => item.id !== currentAdId));
      }
    } catch (err) {
      console.error('Satıcının diğer ilanları yüklenirken hata oluştu:', err);
    } finally {
      setIsLoadingSellerAds(false);
    }
  };

  // Favorilere ekle/çıkar
  const handleToggleFavorite = async (adId) => {
    try {
      // Ana ilan için
      if (adId === ad.id) {
        // Kendi ilanını favorilere ekleyemez
        if (ad.isOwner) {
          toast.info('Kendi ilanınızı favorilere ekleyemezsiniz');
          return;
        }

        if (isFavorited) {
          // Önce UI'ı güncelle
          setIsFavorited(false);
          setAd({...ad, isSelected: false});
          toast.success('İlan favorilerden çıkarıldı');
          
          // Sonra API isteği gönder
          await adService.unselectAd(adId);
        } else {
          // Önce UI'ı güncelle
          setIsFavorited(true);
          setAd({...ad, isSelected: true});
          toast.success('İlan favorilere eklendi');
          
          // Sonra API isteği gönder
          await adService.selectAd(adId);
        }
      } 
      // Satıcının diğer ilanları için
      else {
        const sellerAd = sellerAds.find(sa => sa.id === adId);
        if (sellerAd) {
          // Kendi ilanını favorilere ekleyemez
          if (sellerAd.isOwner) {
            toast.info('Kendi ilanınızı favorilere ekleyemezsiniz');
            return;
          }

          if (sellerAd.isSelected) {
            // Önce UI'ı güncelle
            setSellerAds(sellerAds.map(sa => 
              sa.id === adId ? { ...sa, isSelected: false } : sa
            ));
            toast.success('İlan favorilerden çıkarıldı');
            
            // Sonra API isteği gönder
            await adService.unselectAd(adId);
          } else {
            // Önce UI'ı güncelle
            setSellerAds(sellerAds.map(sa => 
              sa.id === adId ? { ...sa, isSelected: true } : sa
            ));
            toast.success('İlan favorilere eklendi');
            
            // Sonra API isteği gönder
            await adService.selectAd(adId);
          }
        }
      }
    } catch (err) {
      console.error('Favori işlemi sırasında hata oluştu:', err);
      toast.error('İşlem sırasında bir hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
      
      // Hata durumunda UI'ı eski haline getir
      if (adId === ad.id) {
        setIsFavorited(!isFavorited);
        setAd({...ad, isSelected: !ad.isSelected});
      } else {
        setSellerAds(sellerAds.map(sa => 
          sa.id === adId ? { ...sa, isSelected: !sa.isSelected } : sa
        ));
      }
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

  // İlan başarıyla öne çıkarıldıktan sonra
  const handleFeatureSuccess = async () => {
    // İlan detaylarını yeniden yükle
    try {
      const adResponse = await adService.getById(id);
      if (adResponse && adResponse.isSucceeded && adResponse.data && adResponse.data.item) {
        setAd({...adResponse.data.item, isFeatured: true});
        toast.success('İlan başarıyla VIP yapıldı');
      }
    } catch (error) {
      console.error('İlan bilgileri güncellenirken hata:', error);
    }
  };

  // Sohbet odası oluştur
  const handleCreateChatRoom = async () => {
    // Kullanıcı giriş yapmamışsa, giriş sayfasına yönlendir
    if (!isAuthenticated) {
      toast.info('Mesaj göndermek için giriş yapmalısınız');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    
    // İlanın sahibiyse mesaj gönderemez
    if (ad.isOwner) {
      toast.info('Kendi ilanınıza mesaj gönderemezsiniz');
      return;
    }
    
    try {
      setIsCreatingChatRoom(true);
      
      const response = await chatService.createChatRoom(id);
      
      if (response && response.isSucceeded && response.data) {
        // Sohbet odasına git
        navigate(`/messages/${response.data.id}`);
        toast.success('Sohbet başlatıldı');
      } else {
        toast.error(response?.message || 'Sohbet odası oluşturulamadı');
      }
    } catch (err) {
      console.error('Sohbet odası oluşturulurken hata oluştu:', err);
      toast.error('Sohbet odası oluşturulurken bir hata oluştu');
    } finally {
      setIsCreatingChatRoom(false);
    }
  };

  // İlan durumunu değiştir
  const handleChangeStatus = async (newStatus) => {
    if (!isAdmin) return;
    
    setChangingStatus(true);
    
    try {
      const params = {
        adId: id,
        newAdStatus: newStatus
      };
      
      const response = await adService.changeAdStatus(id, newStatus);
      
      if (response && response.isSucceeded) {
        toast.success('İlan durumu başarıyla güncellendi');
        
        // İlan durumunu güncelle
        setAd(prev => ({ ...prev, adStatus: newStatus }));
        setShowStatusOptions(false);
      } else {
        toast.error('İlan durumu güncellenirken bir hata oluştu');
      }
    } catch (err) {
      console.error('İlan durumu değiştirilirken hata:', err);
      toast.error('İlan durumu güncellenirken bir hata oluştu');
    } finally {
      setChangingStatus(false);
    }
  };
  
  // İlan durum adını getir
  const getStatusName = (status) => {
    switch (status) {
      case AdStatus.PENDING:
        return 'Beklemede';
      case AdStatus.ACTIVE:
        return 'Aktif';
      case AdStatus.REJECTED:
        return 'Reddedildi';
      case AdStatus.SOLD:
        return 'Satıldı';
      case AdStatus.EXPIRED:
        return 'Süresi Doldu';
      default:
        return 'Bilinmiyor';
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
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sol Kolon: Resimler ve Detaylar */}
        <div className="lg:col-span-3">
          {/* İlan Başlığı */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-wrap justify-between items-center">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-800 mr-2">{ad.title}</h1>
                <div className="flex items-center gap-2 mt-2">
                  {ad.isFeatured && (
                    <span className="bg-yellow-400 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                      <FaCrown className="h-3 w-3" /> VIP İlan
                    </span>
                  )}
                  <span className="text-xl font-bold text-primary">
                    {formatPrice(ad.price)}
                  </span>
                </div>
              </div>
              
              {/* Eylem Butonları - Sağ Üstte */}
              <div className="flex flex-wrap gap-2">
                {/* İlanı düzenle butonu sadece admin veya ilan sahibi görebilir */}
                {(isAdmin || ad.isOwner) && (
                  <Link 
                    to={`/ads/edit/${ad.id}`}
                    className="btn btn-sm btn-outline flex items-center gap-1"
                  >
                    <FaEdit className="h-4 w-4" /> Düzenle
                  </Link>
                )}
                
                {/* VIP Yap butonu - Öne çıkar */}
                {ad.isOwner && !ad.isFeatured && (
                  <button 
                    className="btn btn-sm btn-warning flex items-center gap-1"
                    onClick={() => setShowFeatureModal(true)}
                  >
                    <FaCrown className="h-4 w-4" /> VIP Yap
                  </button>
                )}
                
                {/* Favorilere Ekleme Butonu */}
                <button
                  onClick={() => handleToggleFavorite(ad.id)}
                  className={`btn btn-sm ${
                    isFavorited 
                      ? 'btn-error text-white' 
                      : 'btn-outline hover:btn-error hover:text-white'
                  } flex items-center gap-1`}
                  disabled={ad.isOwner}
                  title={ad.isOwner ? 'Kendi ilanınızı favorilere ekleyemezsiniz' : ''}
                >
                  {isFavorited ? (
                    <><FaHeart className="h-4 w-4" /></>
                  ) : (
                    <><FaRegHeart className="h-4 w-4" /></>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* İlan Resimleri */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="relative">
              {ad.images && ad.images.length > 0 ? (
                <div className="relative">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                    <img 
                      src={ad.images[currentImageIndex].url} 
                      alt={ad.title} 
                      className="object-contain w-full h-auto max-h-[500px]"
                    />
                  </div>
                  
                  {ad.images.length > 1 && (
                    <>
                      <button 
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-3 shadow-md hover:bg-white"
                        aria-label="Önceki resim"
                      >
                        <FaArrowLeft className="text-gray-700" />
                      </button>
                      <button 
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-3 shadow-md hover:bg-white"
                        aria-label="Sonraki resim"
                      >
                        <FaChevronRight className="text-gray-700" />
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="aspect-w-16 aspect-h-9 bg-gray-100 flex items-center justify-center h-[400px]">
                  <span className="text-gray-400">Resim yok</span>
                </div>
              )}
            </div>
            
            {/* Küçük Resimler */}
            {ad.images && ad.images.length > 1 && (
              <div className="flex overflow-x-auto p-3 gap-2 border-t">
                {ad.images.map((image, index) => (
                  <img 
                    key={index}
                    src={image.url}
                    alt={`${ad.title} - Resim ${index + 1}`}
                    className={`h-20 w-20 object-cover cursor-pointer border-2 rounded ${
                      currentImageIndex === index 
                        ? 'border-primary' 
                        : 'border-transparent hover:border-gray-300'
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* İlan Bilgileri ve Açıklama */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-6">
              {/* Kategori ve Alt Kategori Bilgileri */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
                
                <div className="flex items-center">
                  <FaTag className="text-gray-400 mr-2" />
                  <div>
                    <span className="text-gray-500 text-sm">Durum:</span>
                    <span className="ml-2 font-medium">{ad.isNew ? 'Yeni' : 'İkinci El'}</span>
                  </div>
                </div>
              </div>
              
              {/* Alt Kategori Değerleri */}
              {ad.adSubCategoryValues && ad.adSubCategoryValues.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-medium mb-3 text-gray-800">Ek Özellikler</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    {ad.adSubCategoryValues.map((subCatValue) => {
                      // Alt kategori adını bul
                      const subCategoryName = ad.mainCategory?.subCategories?.find(
                        sc => sc.id === subCatValue.subCategoryId
                      )?.name || 'Özellik';
                      
                      return (
                        <div key={subCatValue.id} className="flex items-start">
                          <FaTag className="text-gray-400 mr-2 mt-1" />
                          <div>
                            <span className="text-gray-500 text-sm">{subCategoryName}:</span>
                            <span className="ml-2 font-medium">{subCatValue.value}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* İlan Açıklaması */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">İlan Açıklaması</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-line">{ad.description}</p>
                  </div>
                </div>
              </div>
              
              {/* İlan Bilgileri */}
              <div className="flex flex-wrap gap-6 p-4 bg-gray-50 rounded-lg mb-6">
                <div className="flex items-center">
                  <FaEye className="text-gray-500 mr-2" />
                  <div>
                    <span className="text-gray-600 text-sm">Görüntülenme:</span>
                    <span className="ml-2 font-medium">{ad.viewCount || 0}</span>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <FaClock className="text-gray-500 mr-2" />
                  <div>
                    <span className="text-gray-600 text-sm">Yayınlanma:</span>
                    <span className="ml-2 font-medium">{formatDate(ad.createdAt)}</span>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <FaMapMarkerAlt className="text-gray-500 mr-2" />
                  <div>
                    <span className="text-gray-600 text-sm">Lokasyon:</span>
                    <span className="ml-2 font-medium">
                      {ad.location?.city}, {ad.location?.country}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Diğer Eylem Butonları */}
              <div className="flex flex-wrap gap-3 mt-4 mb-2">
                {!ad.isOwner && (
                  <button 
                    className="btn btn-outline flex items-center gap-1"
                    onClick={() => setShowReportModal(true)}
                  >
                    <FaFlag className="mr-2" /> İlanı Bildir
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Satıcının Diğer İlanları */}
          {sellerAds.length > 0 && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Satıcının Diğer İlanları</h3>
                
                {isLoadingSellerAds ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {sellerAds.map(sellerAd => (
                      <div key={sellerAd.id} className="col-span-1">
                        <AdCard
                          ad={sellerAd}
                          onFavoriteToggle={(id) => handleToggleFavorite(sellerAd.id)}
                        />
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
        
        {/* Sağ Kolon: Satıcı Bilgileri */}
        <div className="lg:col-span-1">
          {/* Satıcı Bilgileri */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6 sticky top-4">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Satıcı Bilgileri</h3>
              
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
                  
                  {/* Mesaj Gönder Butonu */}
                  {!ad.isOwner && (
                    <button 
                      className="btn btn-primary w-full mb-3"
                      onClick={handleCreateChatRoom}
                      disabled={isCreatingChatRoom}
                    >
                      {isCreatingChatRoom ? (
                        <span className="loading loading-spinner loading-sm mr-2"></span>
                      ) : (
                        <FaComment className="mr-2" />
                      )}
                      Mesaj Gönder
                    </button>
                  )}
                  
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
                        className="btn btn-outline w-full"
                        onClick={() => setShowContactInfo(true)}
                      >
                        İletişim Bilgilerini Göster
                      </button>
                    )}
                  </div>
                  
                  {/* Kullanıcının ilanları bağlantısı */}
                  <div className="pt-3">
                    <Link 
                      to={`/ilanlar?searchedAppUserId=${ad.appUser.id}`}
                      className="btn btn-outline btn-sm w-full"
                    >
                      Tüm İlanlarını Gör
                    </Link>
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
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Güvenlik İpuçları</h3>
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
      
      {/* Yeni Feature Ad Bileşeni */}
      <FeatureAd 
        adId={id} 
        isOpen={showFeatureModal} 
        onClose={() => setShowFeatureModal(false)} 
        onSuccess={handleFeatureSuccess}
      />
      
      {/* İlan Bildirim Modalı - ReportModal bileşeni kullanılıyor */}
      <ReportModal
        adId={id}
        adTitle={ad?.title}
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />
      
      {/* Admin Kontrolü */}
      {isAdmin && ad && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Admin Kontrolleri</h3>
            
            <div className="relative">
              <button
                onClick={() => setShowStatusOptions(!showStatusOptions)}
                disabled={changingStatus}
                className="btn btn-primary"
              >
                {changingStatus ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    İşlem Yapılıyor...
                  </>
                ) : (
                  <>
                    Durum Değiştir: {getStatusName(ad.adStatus)}
                  </>
                )}
              </button>
              
              {showStatusOptions && (
                <div className="absolute right-0 z-10 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 overflow-hidden">
                  <div className="py-1">
                    {Object.values(AdStatus).map((status) => (
                      <button
                        key={status}
                        className={`w-full text-left px-4 py-2 text-sm ${
                          ad.adStatus === status
                            ? 'bg-gray-100 text-gray-900 font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        onClick={() => handleChangeStatus(status)}
                        disabled={ad.adStatus === status || changingStatus}
                      >
                        {ad.adStatus === status && <FaCheck className="inline mr-2 text-green-500" />}
                        {getStatusName(status)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdDetail; 