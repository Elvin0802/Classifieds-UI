import React, { useState, useEffect } from 'react';
import { FaUser, FaKey, FaSave, FaClock, FaCheck, FaTimes, FaCalendarTimes, FaStar, FaEye, FaPen, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import profileService from '../../services/profileService';
import userService from '../../services/userService';
import authStorage from '../../services/authStorage';

const Profile = () => {
  // State tanımlamaları
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [ads, setAds] = useState([]);
  const [adsLoading, setAdsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [passwordData, setPasswordData] = useState({
    userId: '',
    oldPassword: '',
    newPassword: '',
    newPasswordConfirm: ''
  });
  const [formError, setFormError] = useState('');

  // Kullanıcı verilerini getir
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await profileService.getUserData();
        if (response.isSucceeded && response.data?.item) {
          setUserData(response.data.item);
          // Şifre değiştirme formuna userId'yi yerleştir
          setPasswordData(prev => ({ ...prev, userId: response.data.item.id }));
        } else {
          setError('Kullanıcı bilgileri alınamadı');
          toast.error('Kullanıcı bilgileri alınamadı');
        }
      } catch (error) {
        console.error('Kullanıcı verileri alınırken hata:', error);
        setError('Kullanıcı bilgileri alınırken bir hata oluştu');
        toast.error('Kullanıcı bilgileri alınırken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Kullanıcıya ait ilanları getir (aktif tab değiştiğinde)
  useEffect(() => {
    const fetchAds = async () => {
      setAdsLoading(true);
      try {
        let response;
        
        switch (activeTab) {
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
          default:
            response = await profileService.getActiveAds();
        }
        
        if (response.isSucceeded && response.data?.items) {
          setAds(response.data.items);
        } else {
          setAds([]);
        }
      } catch (error) {
        console.error('İlanlar alınırken hata:', error);
        toast.error('İlanlarınız alınırken bir hata oluştu');
        setAds([]);
      } finally {
        setAdsLoading(false);
      }
    };

    fetchAds();
  }, [activeTab]);

  // Şifre değiştirme formu için değişiklik takibi
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  // Şifre değiştirme formu gönderimi
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Şifre kontrolü
    if (passwordData.newPassword !== passwordData.newPasswordConfirm) {
      setFormError('Yeni şifre ve şifre tekrarı eşleşmiyor');
      return;
    }
    
    try {
      const response = await userService.changePassword(passwordData);
      if (response.isSucceeded) {
        toast.success('Şifreniz başarıyla güncellendi');
        // Formu sıfırla
        setPasswordData(prev => ({
          ...prev,
          oldPassword: '',
          newPassword: '',
          newPasswordConfirm: ''
        }));
      } else {
        setFormError(response.message || 'Şifre değiştirme işlemi başarısız oldu');
        toast.error('Şifre değiştirme işlemi başarısız oldu');
      }
    } catch (error) {
      console.error('Şifre değiştirme sırasında hata:', error);
      setFormError('Şifre değiştirilirken bir hata oluştu');
      toast.error('Şifre değiştirilirken bir hata oluştu');
    }
  };

  // İlan durum badgesi için yardımcı fonksiyon
  const getStatusBadge = (ad) => {
    if (ad.isSelected) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><FaStar className="mr-1" /> Seçilmiş</span>;
    }
    if (activeTab === 'active') {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><FaCheck className="mr-1" /> Aktif</span>;
    }
    if (activeTab === 'pending') {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><FaClock className="mr-1" /> Beklemede</span>;
    }
    if (activeTab === 'expired') {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"><FaCalendarTimes className="mr-1" /> Süresi Dolmuş</span>;
    }
    if (activeTab === 'rejected') {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><FaTimes className="mr-1" /> Reddedilmiş</span>;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        <p className="mt-3">Profil bilgileriniz yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sol Bölüm - Kullanıcı Bilgileri ve Şifre Değiştirme */}
        <div className="md:col-span-1">
          {/* Kullanıcı Bilgileri Kartı */}
          <div className="bg-white shadow-md rounded-lg mb-6 overflow-hidden">
            <div className="bg-primary text-white p-4 font-semibold flex items-center">
              <FaUser className="mr-2" /> Kullanıcı Bilgileri
            </div>
            <div className="p-4">
              {userData ? (
                <ul className="divide-y divide-gray-200">
                  <li className="py-3">
                    <strong>Ad Soyad:</strong> {userData.name}
                  </li>
                  <li className="py-3">
                    <strong>E-posta:</strong> {userData.email}
                  </li>
                  <li className="py-3">
                    <strong>Telefon:</strong> {userData.phoneNumber}
                  </li>
                  <li className="py-3">
                    <strong>Üyelik Tarihi:</strong> {new Date(userData.createdAt).toLocaleDateString('tr-TR')}
                  </li>
                </ul>
              ) : (
                <p>Kullanıcı bilgileri bulunamadı.</p>
              )}
            </div>
          </div>

          {/* Şifre Değiştirme Kartı */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="bg-primary text-white p-4 font-semibold flex items-center">
              <FaKey className="mr-2" /> Şifre Değiştir
            </div>
            <div className="p-4">
              {formError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{formError}</div>}
              
              <form onSubmit={handlePasswordSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="oldPassword">
                    Mevcut Şifre
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    type="password"
                    id="oldPassword"
                    name="oldPassword"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newPassword">
                    Yeni Şifre
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength={6}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newPasswordConfirm">
                    Yeni Şifre (Tekrar)
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    type="password"
                    id="newPasswordConfirm"
                    name="newPasswordConfirm"
                    value={passwordData.newPasswordConfirm}
                    onChange={handlePasswordChange}
                    required
                    minLength={6}
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center justify-center"
                >
                  <FaSave className="mr-2" /> Şifreyi Değiştir
                </button>
              </form>
            </div>
          </div>
        </div>
        
        {/* Sağ Bölüm - İlanlar */}
        <div className="md:col-span-3">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="bg-primary text-white p-4 font-semibold">
              İlanlarım
            </div>
            
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button 
                  className={`py-4 px-6 font-medium text-sm ${activeTab === 'active' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('active')}
                >
                  <FaCheck className="inline mr-1" /> Aktif İlanlar
                </button>
                <button 
                  className={`py-4 px-6 font-medium text-sm ${activeTab === 'pending' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('pending')}
                >
                  <FaClock className="inline mr-1" /> Bekleyen İlanlar
                </button>
                <button 
                  className={`py-4 px-6 font-medium text-sm ${activeTab === 'expired' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('expired')}
                >
                  <FaCalendarTimes className="inline mr-1" /> Süresi Dolan
                </button>
                <button 
                  className={`py-4 px-6 font-medium text-sm ${activeTab === 'rejected' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('rejected')}
                >
                  <FaTimes className="inline mr-1" /> Reddedilen
                </button>
                <button 
                  className={`py-4 px-6 font-medium text-sm ${activeTab === 'selected' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('selected')}
                >
                  <FaStar className="inline mr-1" /> Favoriler
                </button>
              </nav>
            </div>
            
            {/* İlan İçeriği */}
            <div className="p-4">
              {adsLoading ? (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2">İlanlar yükleniyor...</p>
                </div>
              ) : ads.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Bu kategoride ilan bulunamadı.</p>
                  <Link to="/ads/create" className="inline-block mt-3 text-primary hover:underline">
                    Yeni İlan Ekle
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İlan</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fiyat</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {ads.map((ad) => (
                        <tr key={ad.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {ad.mainImageUrl ? (
                                <img 
                                  src={ad.mainImageUrl}
                                  alt={ad.title}
                                  className="h-10 w-10 rounded-full object-cover mr-3"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 mr-3 flex items-center justify-center">
                                  <FaUser className="text-gray-400" />
                                </div>
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {ad.title}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {ad.categoryName || 'Kategori belirtilmemiş'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(ad.price)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(ad)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(ad.updatedAt || ad.createdAt).toLocaleDateString('tr-TR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Link 
                                to={`/ads/${ad.id}`}
                                className="text-blue-600 hover:text-blue-900"
                                title="Görüntüle"
                              >
                                <FaEye />
                              </Link>
                              {(activeTab === 'active' || activeTab === 'pending') && (
                                <Link 
                                  to={`/ads/edit/${ad.id}`}
                                  className="text-green-600 hover:text-green-900"
                                  title="Düzenle"
                                >
                                  <FaPen />
                                </Link>
                              )}
                              <button
                                onClick={() => {/* İlan silme işlevi */}}
                                className="text-red-600 hover:text-red-900"
                                title="Sil"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 