import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheck, FaTimes, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';
import moment from 'moment';
import reportService from '../../../services/reportService';
import adService from '../../../services/adService';

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const reportData = await reportService.getReportById(id);
        setReport(reportData);
        
        // Rapor edilen ilanı da getir
        if (reportData.adId) {
          const adData = await adService.getAdById(reportData.adId);
          setAd(adData);
        }
        
        setStatus(reportData.status);
        setLoading(false);
      } catch (err) {
        console.error('Rapor detayı yüklenirken hata:', err);
        setError('Rapor detayı yüklenirken bir hata oluştu.');
        setLoading(false);
        toast.error('Rapor detayı yüklenirken bir hata oluştu.');
      }
    };

    fetchReportData();
  }, [id]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Beklemede</span>;
      case 'UNDER_REVIEW':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">İnceleniyor</span>;
      case 'RESOLVED':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Çözüldü</span>;
      case 'REJECTED':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Reddedildi</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Bilinmiyor</span>;
    }
  };

  const getReasonText = (reason) => {
    switch (reason) {
      case 'INAPPROPRIATE_CONTENT':
        return 'Uygunsuz İçerik';
      case 'FAKE_AD':
        return 'Sahte İlan';
      case 'SPAM':
        return 'Spam';
      case 'WRONG_CATEGORY':
        return 'Yanlış Kategori';
      case 'SCAM':
        return 'Dolandırıcılık';
      case 'OTHER':
        return 'Diğer';
      default:
        return 'Bilinmiyor';
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    
    try {
      setStatusLoading(true);
      await reportService.updateReportStatus(id, newStatus);
      toast.success('Rapor durumu başarıyla güncellendi.');
      setStatusLoading(false);
    } catch (err) {
      console.error('Rapor durumu güncellenirken hata:', err);
      toast.error('Rapor durumu güncellenirken bir hata oluştu.');
      setStatusLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return moment(dateString).format('DD.MM.YYYY HH:mm');
  };

  const handleViewAd = () => {
    if (ad && ad.id) {
      window.open(`/ads/${ad.id}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-4 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-3">Yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-4 px-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button 
          className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded flex items-center"
          onClick={() => navigate('/admin/reports')}
        >
          <FaArrowLeft className="mr-2" /> Raporlara Dön
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 px-4">
      <div className="mb-4">
        <button 
          className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded flex items-center"
          onClick={() => navigate('/admin/reports')}
        >
          <FaArrowLeft className="mr-2" /> Raporlara Dön
        </button>
        <h1 className="mt-3 text-2xl font-bold">Rapor Detayı #{report?.id}</h1>
      </div>

      {report && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8">
            <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b">
                <h5 className="font-medium">Rapor Bilgileri</h5>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-12 mb-3">
                  <div className="col-span-4 font-bold">Rapor ID:</div>
                  <div className="col-span-8">{report.id}</div>
                </div>
                <div className="grid grid-cols-12 mb-3">
                  <div className="col-span-4 font-bold">Rapor Nedeni:</div>
                  <div className="col-span-8">{getReasonText(report.reason)}</div>
                </div>
                <div className="grid grid-cols-12 mb-3">
                  <div className="col-span-4 font-bold">Açıklama:</div>
                  <div className="col-span-8">{report.description || 'Açıklama bulunmuyor.'}</div>
                </div>
                <div className="grid grid-cols-12 mb-3">
                  <div className="col-span-4 font-bold">Raporlayan Kullanıcı:</div>
                  <div className="col-span-8">{report.userId || 'Bilinmiyor'}</div>
                </div>
                <div className="grid grid-cols-12 mb-3">
                  <div className="col-span-4 font-bold">Rapor Tarihi:</div>
                  <div className="col-span-8">{formatDate(report.createdAt)}</div>
                </div>
                <div className="grid grid-cols-12 mb-3">
                  <div className="col-span-4 font-bold">Durum:</div>
                  <div className="col-span-8">
                    {getStatusBadge(report.status)}
                  </div>
                </div>
                <div className="grid grid-cols-12 mb-3">
                  <div className="col-span-4 font-bold">Son Güncelleme:</div>
                  <div className="col-span-8">{formatDate(report.updatedAt)}</div>
                </div>
              </div>
            </div>

            {ad && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b">
                  <h5 className="font-medium">Raporlanan İlan Bilgileri</h5>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-12 mb-3">
                    <div className="col-span-4 font-bold">İlan ID:</div>
                    <div className="col-span-8">{ad.id}</div>
                  </div>
                  <div className="grid grid-cols-12 mb-3">
                    <div className="col-span-4 font-bold">İlan Başlığı:</div>
                    <div className="col-span-8">{ad.title}</div>
                  </div>
                  <div className="grid grid-cols-12 mb-3">
                    <div className="col-span-4 font-bold">Kategori:</div>
                    <div className="col-span-8">{ad.category?.name || 'Bilinmiyor'}</div>
                  </div>
                  <div className="grid grid-cols-12 mb-3">
                    <div className="col-span-4 font-bold">Fiyat:</div>
                    <div className="col-span-8">{ad.price ? `${ad.price} TL` : 'Belirtilmemiş'}</div>
                  </div>
                  <div className="grid grid-cols-12 mb-3">
                    <div className="col-span-4 font-bold">İlan Durumu:</div>
                    <div className="col-span-8">
                      {ad.isActive ? 
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Aktif</span> : 
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Pasif</span>
                      }
                    </div>
                  </div>
                  <button
                    className="mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center"
                    onClick={handleViewAd}
                  >
                    <FaEye className="mr-2" /> İlanı Görüntüle
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-4">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b">
                <h5 className="font-medium">Durum Güncelle</h5>
              </div>
              <div className="p-4">
                <form>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rapor Durumu</label>
                    <select
                      value={status}
                      onChange={handleStatusChange}
                      disabled={statusLoading}
                      className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="PENDING">Beklemede</option>
                      <option value="UNDER_REVIEW">İnceleniyor</option>
                      <option value="RESOLVED">Çözüldü</option>
                      <option value="REJECTED">Reddedildi</option>
                    </select>
                  </div>

                  {statusLoading && (
                    <div className="text-center">
                      <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent"></div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-2 mt-4">
                    <button 
                      type="button"
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded flex items-center justify-center"
                      onClick={() => handleStatusChange({ target: { value: 'RESOLVED' } })}
                      disabled={statusLoading || status === 'RESOLVED'}
                    >
                      <FaCheck className="mr-2" /> Raporu Çöz
                    </button>
                    
                    <button 
                      type="button"
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded flex items-center justify-center"
                      onClick={() => handleStatusChange({ target: { value: 'REJECTED' } })}
                      disabled={statusLoading || status === 'REJECTED'}
                    >
                      <FaTimes className="mr-2" /> Raporu Reddet
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportDetail; 