import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adService, categoryService, reportService } from '../services';
import { REPORT_REASON } from '../services/reportService';
import { Breadcrumb, Carousel, Loading } from '../components/ui';
import { FaPhone, FaEye, FaClock, FaHeart, FaRegHeart, FaStar, FaRegStar, FaFlag, FaTimes, FaCrown } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';

const AdDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [ad, setAd] = useState(null);
  const [category, setCategory] = useState(null);
  const [mainCategory, setMainCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSelected, setIsSelected] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({
    reason: REPORT_REASON.OFFENSIVE,
    description: ''
  });
  const [reportLoading, setReportLoading] = useState(false);

  // VIP yapma ile ilgili state'ler
  const [showVipModal, setShowVipModal] = useState(false);
  const [pricingOptions, setPricingOptions] = useState([]);
  const [selectedVipOption, setSelectedVipOption] = useState(null);
  const [vipLoading, setVipLoading] = useState(false);

  // Alt kategori id'si ile adını bulmak için yardımcı fonksiyon
  const getSubCategoryNameById = (subCategoryId) => {
    if (!mainCategory || !mainCategory.subCategories) return "Özellik";
    
    const subCategory = mainCategory.subCategories.find(sc => sc.id === subCategoryId);
    return subCategory ? subCategory.name : "Özellik";
  };

  useEffect(() => {
    const fetchAdDetails = async () => {
      try {
        setLoading(true);
        const response = await adService.getAdById(id);
        
        // Yeni API yanıt formatı (adDto)
        if (response && response.adDto) {
          setAd(response.adDto);
          
          // Kategori ve ana kategori bilgileri
          if (response.adDto.category) {
            setCategory(response.adDto.category);
          }
          
          if (response.adDto.mainCategory) {
            setMainCategory(response.adDto.mainCategory);
          }
          
          // İlan favori durumu kontrolü - selectorUsersCount değeri API'den gelen değerdir
          setIsSelected(response.adDto.selectorUsersCount > 0);
        } else {
          throw new Error('İlan bilgisi bulunamadı');
        }
      } catch (err) {
        setError('İlan detayları yüklenirken bir hata oluştu.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdDetails();
  }, [id]);

  const handleSelectAd = async () => {
    if (!isAuthenticated) {
      toast.error('Favorilere eklemek için giriş yapmalısınız.');
      return;
    }

    try {
      if (isSelected) {
        const response = await adService.unselectAd(id);
        if (response.isSucceeded) {
          setIsSelected(false);
          toast.success('İlan favorilerden çıkarıldı.');
        } else {
          toast.error(response.message || 'İlan favorilerden çıkarılamadı.');
        }
      } else {
        const response = await adService.selectAd(id);
        if (response.isSucceeded) {
          setIsSelected(true);
          toast.success('İlan favorilere eklendi.');
        } else {
          toast.error(response.message || 'İlan favorilere eklenemedi.');
        }
      }
    } catch (err) {
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
      console.error('Favori işlemi hatası:', err);
    }
  };

  // VIP yapma modalını aç
  const openVipModal = async () => {
    if (!isAuthenticated) {
      toast.error('İlanınızı VIP yapmak için giriş yapmalısınız.');
      return;
    }

    try {
      setVipLoading(true);
      const response = await adService.getPricingOptions();
      
      if (response && response.pricingOptions && response.pricingOptions.length > 0) {
        setPricingOptions(response.pricingOptions);
        setSelectedVipOption(response.pricingOptions[0]?.id);
        setShowVipModal(true);
      } else {
        toast.error('VIP fiyatlandırma seçenekleri bulunamadı.');
      }
    } catch (err) {
      toast.error('Fiyatlandırma seçenekleri alınırken bir hata oluştu.');
      console.error(err);
    } finally {
      setVipLoading(false);
    }
  };

  // İlanı VIP yap
  const handleMakeVip = async () => {
    if (!selectedVipOption) {
      toast.error('Lütfen bir VIP paket seçin.');
      return;
    }

    try {
      setVipLoading(true);
      
      // Seçilen VIP paketini bul
      const selectedOption = pricingOptions.find(option => option.id === selectedVipOption);
      
      if (!selectedOption) {
        toast.error('Geçersiz VIP paket seçimi.');
        return;
      }
      
      const response = await adService.featureAd(id, selectedOption.days);
      
      if (response && response.isSucceeded) {
        toast.success('İlanınız başarıyla VIP yapıldı!');
        setShowVipModal(false);
        
        // İlan bilgilerini güncelle
        const updatedAdResponse = await adService.getAdById(id);
        if (updatedAdResponse && updatedAdResponse.adDto) {
          setAd(updatedAdResponse.adDto);
        }
      } else {
        toast.error(response?.message || 'İlan VIP yapılamadı.');
      }
    } catch (err) {
      toast.error('İşlem sırasında bir hata oluştu.');
      console.error('VIP yapma hatası:', err);
    } finally {
      setVipLoading(false);
    }
  };

  const toggleShowPhone = () => {
    setShowPhone(!showPhone);
  };

  // İlan raporlama formunu açar
  const openReportModal = () => {
    if (!isAuthenticated) {
      toast.error('İlan bildirmek için giriş yapmalısınız.');
      return;
    }
    setShowReportModal(true);
  };

  // Rapor nedeninin adını döndüren yardımcı fonksiyon
  const getReportReasonName = (reasonCode) => {
    switch (reasonCode) {
      case REPORT_REASON.OFFENSIVE:
        return 'Rahatsız Edici İçerik';
      case REPORT_REASON.FAKE:
        return 'Sahte İlan';
      case REPORT_REASON.SPAM:
        return 'Spam';
      case REPORT_REASON.INAPPROPRIATE:
        return 'Uygunsuz İçerik';
      case REPORT_REASON.SCAM:
        return 'Dolandırıcılık';
      case REPORT_REASON.DUPLICATE:
        return 'Tekrarlanan İlan';
      case REPORT_REASON.OTHER:
        return 'Diğer';
      default:
        return 'Bilinmeyen Neden';
    }
  };

  // İlan raporlama formunu gönderir
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    
    if (!reportForm.description.trim() && reportForm.reason === REPORT_REASON.OTHER) {
      toast.error('Lütfen rapor nedeninizi açıklayın.');
      return;
    }
    
    try {
      setReportLoading(true);
      
      const response = await reportService.createReport({
        adId: id,
        reason: reportForm.reason,
        description: reportForm.description
      });
      
      if (response.isSucceeded) {
        toast.success('İlan başarıyla bildirildi. Teşekkür ederiz!');
        setShowReportModal(false);
        setReportForm({
          reason: REPORT_REASON.OFFENSIVE,
          description: ''
        });
      } else {
        toast.error('İlan bildirimi başarısız oldu. Lütfen tekrar deneyin.');
      }
    } catch (err) {
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
      console.error(err);
    } finally {
      setReportLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (error || !ad) {
    return (
      <div className="text-center py-10">
        <p className="text-danger mb-4">{error || 'İlan bulunamadı.'}</p>
        <Link to="/ads" className="btn btn-primary">
          Tüm İlanlara Dön
        </Link>
      </div>
    );
  }

  // Prepare breadcrumb items
  const breadcrumbItems = [
    { label: 'Tüm İlanlar', path: '/ads' },
    { label: category?.name || 'Kategori', path: `/ads?category=${category?.id}` },
    { label: mainCategory?.name || 'Alt Kategori', path: `/ads?mainCategory=${mainCategory?.id}` },
    { label: ad.title }
  ];

  // Prepare photos array for carousel
  const photos = ad.images && ad.images.length > 0 
    ? ad.images.map(img => img.url) 
    : [];

  // API'den gelen isOwner bilgisine göre ilan sahibi kontrolü yapılıyor
  // Bu değer API tarafından kullanıcının kimliğine göre hesaplanır
  const isOwner = ad?.isOwner === true;

  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-8 my-6">
      <Breadcrumb 
        items={[
          { label: 'Tüm İlanlar', path: '/ads' },
          { label: category?.name || 'Kategori', path: `/ads?category=${category?.id}` },
          { label: mainCategory?.name || 'Alt Kategori', path: `/ads?mainCategory=${mainCategory?.id}` },
          { label: ad.title }
        ]} 
        showHome={true}
      />

      <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
        {ad.isFeatured && (
          <div className="bg-yellow-400 text-black p-2 flex items-center justify-center">
            <FaStar className="mr-2" />
            <span className="font-medium">VIP İlan</span>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
          {/* Sol Sütun - İlan Detayları */}
          <div className="lg:col-span-2">
            {/* İlan Başlığı */}
            <h1 className="text-3xl font-bold mb-6">{ad.title}</h1>

            {/* Resim Galerisi */}
            <div className="mb-6">
              {photos.length > 0 ? (
                <Carousel images={photos} height={500} />
              ) : (
                <div className="bg-gray-200 h-96 flex items-center justify-center rounded-lg">
                  <p className="text-gray-500">Resim bulunmuyor</p>
                </div>
              )}
            </div>

            {/* Özellikler */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Özellikler</h2>
              <div className="grid grid-cols-2 gap-4">
                {/* Özellikler grid içeriği buraya gelecek */}
                {category && (
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Kategori:</span>
                    <span className="font-medium">{category.name}</span>
                  </div>
                )}
                
                {mainCategory && (
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Alt Kategori:</span>
                    <span className="font-medium">{mainCategory.name}</span>
                  </div>
                )}
                
                {ad.adSubCategoryValues && ad.adSubCategoryValues.map((subCat, index) => (
                  <div key={index} className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">{getSubCategoryNameById(subCat.subCategoryId) || 'Özellik'}:</span>
                    <span className="font-medium">{subCat.value}</span>
                  </div>
                ))}
                
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Durum:</span>
                  <span className="font-medium">{ad.isNew ? 'Sıfır / Yeni' : 'İkinci El'}</span>
                </div>
                
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Konum:</span>
                  <span className="font-medium">{ad.location?.city}</span>
                </div>

                {/* Açıklama */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Açıklama</h2>
              <p className="whitespace-pre-line">{ad.description}</p>
            </div>

                {/* Sadece ilan sahibine özel bilgiler */}
                {isOwner && (
                  <>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-600">İlan Bitiş Tarihi:</span>
                      <span className="font-medium text-orange-600">{formatDate(ad.expiresAt)}</span>
                    </div>
                    
                    {ad.isFeatured && ad.featureEndDate && (
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">VIP Bitiş Tarihi:</span>
                        <span className="font-medium text-yellow-600">{formatDate(ad.featureEndDate)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-600">Favori Sayısı:</span>
                      <span className="font-medium text-red-600">{ad.selectorUsersCount} kişi</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sağ Sütun - Yan Panel */}
          <div>
            {/* Fiyat Kutusu */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-primary">{formatPrice(ad.price)}</h2>
              </div>
              
              {/* İşlem Butonları */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button 
                  onClick={handleSelectAd}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                    isSelected 
                      ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {isSelected ? <FaHeart /> : <FaRegHeart />}
                  {isSelected ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                </button>
                
                <button 
                  onClick={openReportModal}
                  className="flex items-center gap-2 bg-gray-100 text-gray-600 hover:bg-gray-200 px-4 py-2 rounded-md"
                >
                  <FaFlag />
                  Bildir
                </button>
                
                {/* API'den gelen isOwner=true ise ve ilan VIP değilse VIP yapma butonu göster */}
                {isOwner && !ad.isFeatured && (
                  <button 
                    onClick={openVipModal}
                    className="flex items-center gap-2 bg-yellow-400 text-gray-900 hover:bg-yellow-500 px-4 py-2 rounded-md"
                    disabled={vipLoading}
                  >
                    <FaCrown />
                    {vipLoading ? 'İşleniyor...' : 'VIP Yap'}
                  </button>
                )}
              </div>
              
              <div className="border-t pt-4 mt-2">
                <div className="flex items-center text-gray-600 mb-2">
                  <FaClock className="mr-2" />
                  <span>{formatDate(ad.createdAt)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaEye className="mr-2" />
                  <span>{ad.viewCount} görüntülenme</span>
                </div>
                {/* Sadece ilan sahibi için ek bilgiler göster */}
                {isOwner && (
                  <>
                    <div className="flex items-center text-gray-600 mt-2">
                      <FaHeart className="mr-2 text-red-500" />
                      <span>{ad.selectorUsersCount} kişi favorilere ekledi</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600 mt-2">
                      <FaClock className="mr-2 text-orange-500" />
                      <span>İlan Bitiş Tarihi: {formatDate(ad.expiresAt)}</span>
                    </div>
                    
                    {ad.isFeatured && ad.featureEndDate && (
                      <div className="flex items-center text-gray-600 mt-2">
                        <FaStar className="mr-2 text-yellow-500" />
                        <span>VIP Bitiş Tarihi: {formatDate(ad.featureEndDate)}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            
            {/* İletişim Bilgileri */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Satıcı Bilgileri</h2>
              
              <div className="mb-4">
                <h3 className="font-medium">{ad.appUser?.name}</h3>
                {showPhone ? (
                  <p className="mt-1 text-primary font-medium">{ad.appUser?.phoneNumber}</p>
                ) : (
                  <button 
                    onClick={toggleShowPhone}
                    className="mt-2 flex items-center bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
                  >
                    <FaPhone className="mr-2" />
                    Telefon Numarasını Göster
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
            <button 
              onClick={() => setShowReportModal(false)}
              className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <FaTimes />
            </button>
            
            <h2 className="text-2xl font-bold mb-6">İlanı Bildir</h2>
            
            <form onSubmit={handleSubmitReport}>
              <div className="mb-4">
                <label className="block mb-2 font-medium">Bildirim Nedeni</label>
                <select
                  value={reportForm.reason}
                  onChange={(e) => setReportForm({...reportForm, reason: parseInt(e.target.value)})}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  disabled={reportLoading}
                >
                  <option value={REPORT_REASON.OFFENSIVE}>{getReportReasonName(REPORT_REASON.OFFENSIVE)}</option>
                  <option value={REPORT_REASON.FAKE}>{getReportReasonName(REPORT_REASON.FAKE)}</option>
                  <option value={REPORT_REASON.SPAM}>{getReportReasonName(REPORT_REASON.SPAM)}</option>
                  <option value={REPORT_REASON.INAPPROPRIATE}>{getReportReasonName(REPORT_REASON.INAPPROPRIATE)}</option>
                  <option value={REPORT_REASON.SCAM}>{getReportReasonName(REPORT_REASON.SCAM)}</option>
                  <option value={REPORT_REASON.DUPLICATE}>{getReportReasonName(REPORT_REASON.DUPLICATE)}</option>
                  <option value={REPORT_REASON.OTHER}>{getReportReasonName(REPORT_REASON.OTHER)}</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block mb-2 font-medium">Açıklama</label>
                <textarea
                  value={reportForm.description}
                  onChange={(e) => setReportForm({...reportForm, description: e.target.value})}
                  placeholder="Lütfen bildirim nedeninizi detaylandırın..."
                  className="w-full p-3 border border-gray-300 rounded-md h-32 resize-none"
                  disabled={reportLoading}
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="w-full bg-red-500 text-white py-3 rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
                disabled={reportLoading}
              >
                {reportLoading ? 'Gönderiliyor...' : 'Bildirimi Gönder'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* VIP Yapma Modal */}
      {showVipModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-semibold">İlanınızı VIP Yapın</h3>
              <button 
                onClick={() => setShowVipModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-4">
              <p className="mb-4 text-gray-700">
                VIP ilanlar diğer ilanlardan daha fazla görüntülenir ve daha fazla ilgi çeker.
                Aşağıdan bir VIP paket seçerek ilanınızı öne çıkarabilirsiniz.
              </p>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">VIP Paket Seçin</label>
                
                {pricingOptions.length > 0 ? (
                  <div className="space-y-3">
                    {pricingOptions.map((option) => (
                      <div 
                        key={option.id}
                        className={`border rounded-lg p-3 cursor-pointer 
                          ${selectedVipOption === option.id ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'}`}
                        onClick={() => setSelectedVipOption(option.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{option.days} Gün</h4>
                            <p className="text-sm text-gray-600">
                              İlanınız {option.days} gün boyunca VIP olarak gösterilir
                            </p>
                          </div>
                          <div className="text-lg font-bold text-yellow-600">
                            {new Intl.NumberFormat('tr-TR', {
                              style: 'currency',
                              currency: 'TRY'
                            }).format(option.price)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Yükleniyor...</p>
                )}
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowVipModal(false)}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md"
                >
                  İptal
                </button>
                <button
                  onClick={handleMakeVip}
                  disabled={vipLoading || !selectedVipOption}
                  className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-md hover:bg-yellow-500 disabled:bg-yellow-200 disabled:text-gray-600"
                >
                  {vipLoading ? 'İşleniyor...' : 'VIP Yap'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdDetailPage; 