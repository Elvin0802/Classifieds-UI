import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { profileService, adService, reportService } from '../services';
import { AdCard, Loading, Modal } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { FaUser, FaEnvelope, FaPhone, FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaCalendarTimes, FaLock, FaExclamationTriangle, FaHeart, FaEdit, FaTrash, FaCrown } from 'react-icons/fa';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { PasswordInput } from '../components/ui';

const ProfilePage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('active');
  const [userData, setUserData] = useState(null);
  const [ads, setAds] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // İlan düzenleme için state'ler
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentAd, setCurrentAd] = useState(null);
  const [editFormData, setEditFormData] = useState({
    id: '',
    description: '',
    price: 0,
    isNew: false
  });
  
  // İlan silme için state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteAdId, setDeleteAdId] = useState(null);
  
  // İşlem durumu için state
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // VIP yapma ile ilgili state'ler
  const [showVipModal, setShowVipModal] = useState(false);
  const [adToVip, setAdToVip] = useState(null);
  const [pricingOptions, setPricingOptions] = useState([]);
  const [selectedVipOption, setSelectedVipOption] = useState(null);
  const [vipLoading, setVipLoading] = useState(false);

  const profileFormik = useFormik({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phoneNumber || user?.phone || ''
    },
    validationSchema: Yup.object({
      name: Yup.string().required('İsim zorunludur'),
      email: Yup.string().email('Geçerli bir e-posta adresi girin').required('E-posta zorunludur'),
      phone: Yup.string().matches(/^[+]?[0-9]{10,15}$/, 'Geçerli bir telefon numarası girin')
    }),
    onSubmit: async (values) => {
      try {
        // API çağrısı yapılacak
        toast.success('Profil bilgileri güncellendi');
        setIsEditing(false);
      } catch (error) {
        toast.error('Profil güncellenirken bir hata oluştu');
      }
    }
  });

  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    validationSchema: Yup.object({
      currentPassword: Yup.string().required('Mevcut şifre zorunludur'),
      newPassword: Yup.string()
        .min(6, 'Şifre en az 6 karakter olmalıdır')
        .required('Yeni şifre zorunludur'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword'), null], 'Şifreler eşleşmiyor')
        .required('Şifre tekrarı zorunludur')
    }),
    onSubmit: async (values) => {
      try {
        setActionLoading(true);
        
        // API'ye göre şifre değiştirme isteği gönder
        const response = await profileService.changePassword({
          userId: user.id, // Kullanıcı ID'si
          oldPassword: values.currentPassword,
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword
        });
        
        if (response.isSucceeded) {
          toast.success('Şifre başarıyla güncellendi');
          setIsChangingPassword(false);
          passwordFormik.resetForm();
        } else {
          toast.error(response.message || 'Şifre güncellenirken bir hata oluştu');
        }
      } catch (error) {
        console.error('Şifre güncelleme hatası:', error);
        toast.error(error.message || 'Şifre güncellenirken bir hata oluştu');
      } finally {
        setActionLoading(false);
      }
    }
  });

  useEffect(() => {
    // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
    if (!isAuthenticated && !loading) {
      navigate('/login');
      return;
    }

    // Sayfa ilk kez yüklendiğinde veya kullanıcı kimliği değiştiğinde veri çek
    if (isAuthenticated && !userData) {
      fetchUserData();
    }
    
    // Kullanıcı verisi güncellendiğinde formik değerlerini güncelle
    if (userData) {
      profileFormik.setValues({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phoneNumber || userData.phone || ''
      });
    }
  }, [isAuthenticated, loading, navigate, userData]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const data = await profileService.getUserData();
      // API yanıtı appUserDto içinde geliyor, buna göre veriyi ayarla
      setUserData(data.appUserDto || data);
      // İlk sekme için verileri getir
      await fetchAds('active');
    } catch (err) {
      console.error('Kullanıcı verileri getirilirken hata oluştu:', err);
      setError('Kullanıcı bilgileri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAds = async (tabName) => {
    try {
      setLoading(true);
      let response;

      switch (tabName) {
        case 'active':
          response = await profileService.getActiveAds();
          break;
        case 'pending':
          response = await profileService.getPendingAds();
          break;
        case 'expired':
          response = await profileService.getExpiredAds();
          break;
        case 'rejected':
          response = await profileService.getRejectedAds();
          break;
        case 'selected':
          response = await profileService.getSelectedAds();
          break;
        case 'reported':
          // Kullanıcının raporlanmış ilanlarını al
          await fetchReportedAds();
          return; // fetchReportedAds kendi içinde loading'i false yapacak
        default:
          response = await profileService.getActiveAds();
      }

      console.log(`${tabName} ilanlar yanıtı:`, response); // Yanıtı kontrol etmek için loglama ekleyelim
      
      // API yanıtı şimdi 'items' içinde geliyor, buna göre veriyi ayarla
      setAds(response.items || []);
      setActiveTab(tabName);
    } catch (err) {
      console.error('İlanlar getirilirken hata oluştu:', err);
      setError('İlanlar yüklenirken bir hata oluştu.');
      setAds([]);
    } finally {
      if (tabName !== 'reported') {
        setLoading(false);
      }
    }
  };

  // Raporlanmış ilanları getir
  const fetchReportedAds = async () => {
    try {
      setLoading(true);
      
      // Kullanıcının tüm raporlanmış ilanlarını getir
      const adsResponse = await profileService.getActiveAds();
      const allUserAds = adsResponse.items || []; // 'items' olarak değiştirildi
      
      // Tüm ilanların ID'lerini al
      const adIds = allUserAds.map(ad => ad.id);
      
      // Raporlanmış ilanları getirecek bir liste oluştur
      let reportedAds = [];
      let reportsList = [];
      
      // Her bir ilan için rapor olup olmadığını kontrol et
      for (const adId of adIds) {
        try {
          const reportResponse = await reportService.getReportsByAdId(adId);
          if (reportResponse && reportResponse.items && reportResponse.items.length > 0) {
            // Bu ilan için rapor var, ilgili ilanı bul ve reportedAds listesine ekle
            const ad = allUserAds.find(a => a.id === adId);
            if (ad) {
              reportedAds.push(ad);
              // Her ilanın raporlarını da sakla
              reportsList = [...reportsList, ...reportResponse.items];
            }
          }
        } catch (error) {
          console.error(`İlan ID ${adId} için raporlar getirilirken hata:`, error);
        }
      }
      
      setAds(reportedAds);
      setReports(reportsList);
      setActiveTab('reported');
    } catch (err) {
      console.error('Raporlanmış ilanlar getirilirken hata oluştu:', err);
      setError('Raporlanmış ilanlar yüklenirken bir hata oluştu.');
      setAds([]);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabName) => {
    fetchAds(tabName);
  };
  
  // İlan düzenleme modalını aç
  const handleEditClick = (ad) => {
    setCurrentAd(ad);
    setEditFormData({
      id: ad.id,
      description: ad.description || '',
      price: ad.price || 0,
      isNew: ad.isNew || false
    });
    setShowEditModal(true);
  };
  
  // İlan silme onay modalını aç
  const handleDeleteClick = (adId) => {
    setDeleteAdId(adId);
    setShowDeleteConfirm(true);
  };
  
  // Form alanları değişikliklerini izle
  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // İlanı güncelle
  const handleUpdateAd = async (e) => {
    e.preventDefault();
    
    try {
      setActionLoading(true);
      
      const response = await adService.updateAd({
        id: editFormData.id,
        description: editFormData.description,
        price: parseFloat(editFormData.price),
        isNew: editFormData.isNew
      });
      
      if (response.isSucceeded) {
        // İlan başarıyla güncellendi, mevcut ilan listesini güncelle
        const updatedAds = ads.map(ad => 
          ad.id === editFormData.id ? { ...ad, ...editFormData } : ad
        );
        setAds(updatedAds);
        
        toast.success('İlan başarıyla güncellendi');
        setShowEditModal(false);
      } else {
        toast.error(response.message || 'İlan güncellenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('İlan güncelleme hatası:', error);
      toast.error(error.message || 'İlan güncellenirken bir hata oluştu');
    } finally {
      setActionLoading(false);
    }
  };
  
  // İlanı sil
  const handleDeleteAd = async () => {
    try {
      setActionLoading(true);
      
      const response = await adService.deleteAd(deleteAdId);
      
      if (response.isSucceeded) {
        // İlan başarıyla silindi, listeden kaldır
        const filteredAds = ads.filter(ad => ad.id !== deleteAdId);
        setAds(filteredAds);
        
        toast.success('İlan başarıyla silindi');
        setShowDeleteConfirm(false);
      } else {
        toast.error(response.message || 'İlan silinirken bir hata oluştu');
      }
    } catch (error) {
      console.error('İlan silme hatası:', error);
      toast.error(error.message || 'İlan silinirken bir hata oluştu');
    } finally {
      setActionLoading(false);
    }
  };

  // VIP yapma modalını aç
  const handleVipClick = async (ad) => {
    try {
      setVipLoading(true);
      setAdToVip(ad);
      
      const response = await adService.getPricingOptions();
      
      if (response && response.items && response.items.length > 0) {
        // API yanıtını beklenen formata dönüştür
        const formattedOptions = response.items.map((item, index) => ({
          id: index + 1, // Benzersiz ID oluştur
          days: item.durationDays,
          price: item.price,
          description: item.description
        }));
        
        setPricingOptions(formattedOptions);
        setSelectedVipOption(formattedOptions[0]?.id);
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
    if (!adToVip || !selectedVipOption) {
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
      
      const response = await adService.featureAd(adToVip.id, selectedOption.days);
      
      if (response && response.isSucceeded) {
        toast.success('İlanınız başarıyla VIP yapıldı!');
        setShowVipModal(false);
        
        // Aktif ilanları yeniden yükle
        fetchAds(activeTab);
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

  if (loading && !userData) {
    return <Loading fullScreen />;
  }

  // Aktif sekmenin başlığını döndüren yardımcı fonksiyon
  const getTabTitle = () => {
    switch (activeTab) {
      case 'active':
        return 'Aktif İlanlarım';
      case 'pending':
        return 'Onay Bekleyen İlanlarım';
      case 'expired':
        return 'Süresi Dolmuş İlanlarım';
      case 'rejected':
        return 'Reddedilmiş İlanlarım';
      case 'selected':
        return 'Favori İlanlarım';
      case 'reported':
        return 'Raporlanmış İlanlarım';
      default:
        return 'İlanlarım';
    }
  };

  // Profil formunu render eder
  const renderProfileForm = () => {
    return (
      <form onSubmit={profileFormik.handleSubmit} className="space-y-4">
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <FaUser className="mr-2" />
            Ad Soyad
          </label>
          <input
            type="text"
            {...profileFormik.getFieldProps('name')}
            disabled={!isEditing}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${
              !isEditing ? 'bg-gray-100' : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            }`}
          />
          {profileFormik.touched.name && profileFormik.errors.name && (
            <div className="text-red-500 text-sm mt-1">{profileFormik.errors.name}</div>
          )}
        </div>

        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <FaEnvelope className="mr-2" />
            E-posta
          </label>
          <input
            type="email"
            {...profileFormik.getFieldProps('email')}
            disabled={!isEditing}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${
              !isEditing ? 'bg-gray-100' : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            }`}
          />
          {profileFormik.touched.email && profileFormik.errors.email && (
            <div className="text-red-500 text-sm mt-1">{profileFormik.errors.email}</div>
          )}
        </div>

        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <FaPhone className="mr-2" />
            Telefon
          </label>
          <input
            type="tel"
            {...profileFormik.getFieldProps('phone')}
            disabled={!isEditing}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${
              !isEditing ? 'bg-gray-100' : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            }`}
          />
          {profileFormik.touched.phone && profileFormik.errors.phone && (
            <div className="text-red-500 text-sm mt-1">{profileFormik.errors.phone}</div>
          )}
        </div>

        {isEditing ? (
          <div className="flex space-x-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Kaydet
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                profileFormik.resetForm();
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              İptal
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Düzenle
          </button>
        )}
      </form>
    );
  };

  // Şifre değiştirme formunu render eder
  const renderPasswordForm = () => {
    return (
      <form onSubmit={passwordFormik.handleSubmit} className="space-y-4">
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <FaLock className="mr-2" />
            Mevcut Şifre
          </label>
          <PasswordInput
            name="currentPassword"
            disabled={actionLoading}
            {...passwordFormik.getFieldProps('currentPassword')}
            error={
              passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword
                ? passwordFormik.errors.currentPassword
                : null
            }
          />
        </div>

        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <FaLock className="mr-2" />
            Yeni Şifre
          </label>
          <PasswordInput
            name="newPassword"
            disabled={actionLoading}
            {...passwordFormik.getFieldProps('newPassword')}
            error={
              passwordFormik.touched.newPassword && passwordFormik.errors.newPassword
                ? passwordFormik.errors.newPassword
                : null
            }
          />
        </div>

        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <FaLock className="mr-2" />
            Yeni Şifre Tekrar
          </label>
          <PasswordInput
            name="confirmPassword"
            disabled={actionLoading}
            {...passwordFormik.getFieldProps('confirmPassword')}
            error={
              passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword
                ? passwordFormik.errors.confirmPassword
                : null
            }
          />
        </div>

        <div className="flex space-x-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center"
            disabled={actionLoading}
          >
            {actionLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                İşleniyor...
              </>
            ) : (
              'Şifreyi Güncelle'
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsChangingPassword(false);
              passwordFormik.resetForm();
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            disabled={actionLoading}
          >
            İptal
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="container-custom py-8">
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {actionSuccess && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
          <p>{actionSuccess}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Soldaki profil kartı */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Profil Bilgileri</h2>
              {renderProfileForm()}
            </div>
            
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Şifre</h3>
                <button
                  onClick={() => setIsChangingPassword(!isChangingPassword)}
                  className="text-primary hover:text-blue-700 text-sm"
                >
                  {isChangingPassword ? 'İptal' : 'Şifremi Değiştir'}
                </button>
              </div>
              
              {isChangingPassword && renderPasswordForm()}
            </div>
          </div>
        </div>
        
        {/* Sağdaki içerik alanı */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-lg shadow-md">
            {/* Sekmeler */}
            <div className="border-b px-6 overflow-x-auto scrollbar-none">
              <div className="flex whitespace-nowrap">
                <button 
                  className={`mr-4 py-2 px-4 font-medium ${activeTab === 'active' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
                  onClick={() => handleTabChange('active')}
                >
                  <FaCheckCircle className="inline mr-2" />
                  Aktif
                </button>
                <button 
                  className={`mr-4 py-2 px-4 font-medium ${activeTab === 'pending' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
                  onClick={() => handleTabChange('pending')}
                >
                  <FaHourglassHalf className="inline mr-2" />
                  Onay Bekleyen
                </button>
                <button 
                  className={`mr-4 py-2 px-4 font-medium ${activeTab === 'expired' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
                  onClick={() => handleTabChange('expired')}
                >
                  <FaCalendarTimes className="inline mr-2" />
                  Süresi Dolmuş
                </button>
                <button 
                  className={`mr-4 py-2 px-4 font-medium ${activeTab === 'rejected' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
                  onClick={() => handleTabChange('rejected')}
                >
                  <FaTimesCircle className="inline mr-2" />
                  Reddedilmiş
                </button>
                <button 
                  className={`mr-4 py-2 px-4 font-medium ${activeTab === 'selected' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
                  onClick={() => handleTabChange('selected')}
                >
                  <FaHeart className="inline mr-2" />
                  Favoriler
                </button>
                <button 
                  className={`mr-4 py-2 px-4 font-medium ${activeTab === 'reported' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
                  onClick={() => handleTabChange('reported')}
                >
                  <FaExclamationTriangle className="inline mr-2" />
                  Raporlananlar
                </button>
              </div>
            </div>

            {/* İlanların listesi */}
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">{getTabTitle()}</h2>
              
              {loading ? (
                <Loading />
              ) : ads.length > 0 ? (
                activeTab === 'reported' ? (
                  <div className="space-y-6">
                    {ads.map(ad => {
                      // Bu ilan için olan raporları bul
                      const adReports = reports.filter(report => report.adId === ad.id);
                      
                      return (
                        <div key={ad.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                          <div className="mb-3">
                            <AdCard 
                              id={ad.id}
                              title={ad.title}
                              description={ad.description}
                              price={ad.price}
                              location={ad.locationCityName || ad.location}
                              imageUrl={ad.mainImageUrl || (ad.images && ad.images.length > 0 ? ad.images[0].url : null)}
                              createdAt={ad.updatedAt || ad.createdAt}
                              isFeatured={ad.isFeatured}
                              isFavorite={ad.isSelected || false}
                              disableLink={true}
                            />
                          </div>
                          
                          <div className="flex justify-center mb-3">
                            <Link 
                              to={`/ads/${ad.id}`}
                              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              İlan Detayına Git
                            </Link>
                          </div>
                          
                          <div className="mt-4">
                            <h4 className="font-medium text-red-600 flex items-center">
                              <FaExclamationTriangle className="mr-2" /> 
                              Bu ilan için {adReports.length} rapor bulunuyor
                            </h4>
                            
                            <div className="mt-2 space-y-2">
                              {adReports.map(report => (
                                <div key={report.id} className="text-sm bg-white p-3 rounded border border-red-100">
                                  <p><strong>Rapor Nedeni:</strong> {report.reason === 1 ? 'Rahatsız Edici İçerik' : 
                                                                            report.reason === 2 ? 'Sahte İlan' :
                                                                            report.reason === 3 ? 'Spam' :
                                                                            report.reason === 4 ? 'Uygunsuz İçerik' : 
                                                                            report.reason === 5 ? 'Dolandırıcılık' :
                                                                            report.reason === 6 ? 'Tekrarlanan İlan' : 'Diğer'}</p>
                                  {report.description && <p><strong>Açıklama:</strong> {report.description}</p>}
                                  <p><strong>Durum:</strong> {report.status === 1 ? 'Beklemede' : 
                                                                    report.status === 2 ? 'İnceleniyor' :
                                                                    report.status === 3 ? 'Çözüldü' : 'Reddedildi'}</p>
                                  <p><strong>Rapor Tarihi:</strong> {new Date(report.createdAt).toLocaleDateString('tr-TR')}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ads.map(ad => (
                      <div key={ad.id} className="relative">
                        {/* Edit, VIP ve Delete buttons */}
                        {activeTab !== 'selected' && (
                          <div className="absolute top-2 right-2 flex space-x-2 z-10">
                            <button
                              onClick={() => handleEditClick(ad)}
                              className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 transition-colors shadow-md"
                              title="Düzenle"
                            >
                              <FaEdit />
                            </button>
                            {!ad.isFeatured && (
                              <button
                                onClick={() => handleVipClick(ad)}
                                className="bg-yellow-400 text-gray-900 rounded-full p-2 hover:bg-yellow-500 transition-colors shadow-md"
                                title="VIP Yap"
                              >
                                <FaCrown />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteClick(ad.id)}
                              className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-md"
                              title="Sil"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        )}
                        
                        <AdCard 
                          id={ad.id}
                          title={ad.title}
                          description={ad.description}
                          price={ad.price}
                          location={ad.locationCityName || ad.location}
                          imageUrl={ad.mainImageUrl || (ad.images && ad.images.length > 0 ? ad.images[0].url : null)}
                          createdAt={ad.updatedAt || ad.createdAt}
                          isFeatured={ad.isFeatured}
                          isFavorite={ad.isSelected || false}
                          disableLink={true}
                        />
                        
                        <div className="flex justify-center mt-2">
                          <Link 
                            to={`/ads/${ad.id}`}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            İlan Detayına Git
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Bu kategoride ilan bulunmuyor.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">İlanı Düzenle</h3>
            
            <form onSubmit={handleUpdateAd}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fiyat (₺)
                </label>
                <input
                  type="number"
                  name="price"
                  value={editFormData.price}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isNew"
                    checked={editFormData.isNew}
                    onChange={handleEditFormChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Ürün yeni mi?</span>
                </label>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  disabled={actionLoading}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Güncelleniyor...' : 'Güncelle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">İlanı Silmeyi Onayla</h3>
            <p className="mb-6">Bu ilanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                disabled={actionLoading}
              >
                İptal
              </button>
              <button
                onClick={handleDeleteAd}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                disabled={actionLoading}
              >
                {actionLoading ? 'Siliniyor...' : 'Sil'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIP Yapma Modal */}
      {showVipModal && (
        <Modal
          title="İlanınızı VIP Yapın"
          onClose={() => setShowVipModal(false)}
          footer={
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowVipModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
              >
                İptal
              </button>
              <button
                onClick={handleMakeVip}
                className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-md hover:bg-yellow-500"
                disabled={vipLoading || !selectedVipOption}
              >
                {vipLoading ? 'İşleniyor...' : 'VIP Yap'}
              </button>
            </div>
          }
        >
          <div>
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
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ProfilePage; 