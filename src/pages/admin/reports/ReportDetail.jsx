import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheck, FaTimes, FaEye, FaClock, FaSyncAlt, FaBan, FaExclamationTriangle, FaUser, FaShieldAlt, FaPen, FaSave, FaTrashAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import reportService from '../../../services/reportService';
import adService from '../../../services/adService';
import blacklistService from '../../../services/blacklistService';

// Report Status Enum
const ReportStatus = {
  PENDING: 0,
  UNDER_REVIEW: 1,
  RESOLVED: 2,
  REJECTED: 3
};

// Report Reason Enum
const ReportReason = {
  INAPPROPRIATE: 0,
  MISLEADING: 1,
  FRAUDULENT: 2,
  DUPLICATE: 3,
  WRONG_CATEGORY: 4,
  SPAM: 5,
  OTHER: 6
};

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(0);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const [blockReason, setBlockReason] = useState('Report səbəbi ilə bloklandı');

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await reportService.getReportById(id);
        
        if (response && response.isSucceeded && response.data?.item) {
          const reportData = response.data.item;
          setReport(reportData);
          setStatus(reportData.status);
          setReviewNotes(reportData.reviewNotes || '');
          
          // Rapor edilen ilanı da getir
          if (reportData.adId) {
            try {
              const adResponse = await adService.getById(reportData.adId);
              if (adResponse && adResponse.isSucceeded && adResponse.data?.item) {
                setAd(adResponse.data.item);
              }
            } catch (err) {
              console.error('İlan detayları yüklenirken hata:', err);
            }
          }
        } else {
          setError(response?.message || 'Rapor detayı yüklenemedi');
          toast.error(response?.message || 'xəta');
        }
      } catch (err) {
        console.error('Rapor detayı yüklenirken hata:', err);
        setError('xəta.');
        toast.error('xəta');
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [id]);

  const handleUpdateStatus = async () => {
    try {
      setUpdateLoading(true);
      
      const updateData = {
        reportId: id,
        status: parseInt(status),
        reviewNotes: reviewNotes
      };
      
      const response = await reportService.updateReportStatus(updateData);
      
      if (response && response.isSucceeded) {
        toast.success('xəta.');
        // Rapor verilerini güncelle
        const updatedReport = { ...report, status: parseInt(status), reviewNotes };
        setReport(updatedReport);
        setIsEditing(false);
      } else {
        toast.error(response?.message || 'xəta');
      }
    } catch (error) {
      console.error('Rapor durumu güncellenirken hata:', error);
      toast.error('xəta');
    } finally {
      setUpdateLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case ReportStatus.PENDING:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium bg-yellow-100 text-yellow-800"><FaClock /> Gözləyir</span>;
      case ReportStatus.UNDER_REVIEW:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800"><FaSyncAlt /> Baxılır</span>;
      case ReportStatus.RESOLVED:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium bg-green-100 text-green-800"><FaCheck /> Həll olunub</span>;
      case ReportStatus.REJECTED:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium bg-red-100 text-red-800"><FaBan /> İmtna edilib</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800">Bilinmir</span>;
    }
  };

  const getReasonText = (reason) => {
    switch (reason) {
      case ReportReason.INAPPROPRIATE:
        return 'Uyğun olmayan Məzmun';
      case ReportReason.MISLEADING:
        return 'Yanlış məlumat';
      case ReportReason.FRAUDULENT:
        return 'Fırıldaqçılıq';
      case ReportReason.DUPLICATE:
        return 'Dublikat Elan';
      case ReportReason.WRONG_CATEGORY:
        return 'Səhv Kateqoriya';
      case ReportReason.SPAM:
        return 'Spam';
      case ReportReason.OTHER:
        return 'Diger';
      default:
        return 'Bilinmir';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('az-AZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleViewAd = () => {
    if (ad && ad.id) {
      window.open(`/ilanlar/${ad.id}`, '_blank');
    }
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      // Düzenleme moduna geçerken mevcut değerleri kopyala
      setStatus(report.status);
      setReviewNotes(report.reviewNotes || '');
    }
  };

  const handleBlockUser = async () => {
    if (!ad?.appUser?.email) {
      toast.error('İstifadəçi emaili tapılmadı!');
      return;
    }
    if (!window.confirm('Bu istifadəçini bloklamaq istəyirsiniz?')) return;
    setBlockLoading(true);
    try {
      const response = await blacklistService.blacklistUser(ad.appUser.email, blockReason);
      if (response.isSucceeded) {
        toast.success('İstifadəçi bloklandı!');
      } else {
        toast.error(response.message || 'Bloklama alınmadı!');
      }
    } catch (err) {
      toast.error('Bloklama zamanı xəta baş verdi!');
    } finally {
      setBlockLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Yüklənir...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <button 
          onClick={() => navigate('/admin/reports')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <FaArrowLeft /> Geri
        </button>
        
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex items-start">
            <FaExclamationTriangle className="text-red-500 mt-0.5 mr-3" />
            <div>
              <h3 className="text-red-800 font-medium">Xəta Yarandı</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container mx-auto px-4 py-8">
        <button 
          onClick={() => navigate('/admin/reports')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <FaArrowLeft /> Geri
        </button>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-700">Tapılmadı.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button 
          onClick={() => navigate('/admin/reports')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <FaArrowLeft /> Geri
        </button>
        
        <h1 className="text-2xl font-bold text-gray-900 mt-4 flex items-center gap-2">
          <FaShieldAlt className="text-primary" /> Detaylar
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sol Sütun - Rapor Detayları */}
        <div className="md:col-span-2 space-y-6">
          {/* Rapor Bilgileri */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="font-semibold text-gray-800">Şikayət Məlumatları</h2>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">ID</dt>
                      <dd className="mt-1 text-sm text-gray-900">{report.id}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Şikayət Səbəbi</dt>
                      <dd className="mt-1 text-sm text-gray-900">{getReasonText(report.reason)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Vəziyyət</dt>
                      <dd className="mt-1">{getStatusBadge(report.status)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Yaradılma Tarixi</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatDate(report.createdAt)}</dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Şikayət edən istifadəçi</dt>
                      <dd className="mt-1 text-sm text-gray-900 flex items-center gap-1">
                        <FaUser className="text-gray-400" />
                        {report.reportedByUserName || 'İsimsiz Kullanıcı'}
                        <span className="text-xs text-gray-500">({report.reportedByUserId})</span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Statusunu Vəziyyəti</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {report.reviewedByUserName ? (
                          <span className="flex items-center gap-1">
                            <FaUser className="text-gray-400" />
                            {report.reviewedByUserName} tərəfindən baxildi
                            <span className="text-xs text-gray-500">({formatDate(report.reviewedAt)})</span>
                          </span>
                        ) : (
                          <span className="text-yellow-600">Baxılmayıb</span>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Son Dəyişiklik</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatDate(report.updatedAt)}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Açıqlama</h3>
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-800 whitespace-pre-line">
                    {report.description || 'Açıklama bulunmuyor.'}
                  </p>
                </div>
              </div>

              {report.reviewNotes && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Qeydləri nəzərdən keçirin</h3>
                  <div className="p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-800 whitespace-pre-line">
                      {report.reviewNotes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* İlan Bilgileri */}
          {ad ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="font-semibold text-gray-800">Elan Məlumatları</h2>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{ad.title}</h3>
                  <button
                    onClick={handleViewAd}
                    className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FaEye className="mr-1" />
                    <span>Elana Bax</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <dl className="space-y-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Elan ID</dt>
                        <dd className="mt-1 text-sm text-gray-900">{ad.id}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Qiymət</dt>
                        <dd className="mt-1 text-sm text-gray-900">{ad.price ? `${ad.price} AZN` : 'yoxdur'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Elan Vəziyyəti</dt>
                        <dd className="mt-1">
                          {ad.adStatus === 1 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <FaCheck className="mr-1" /> Aktiv
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <FaTimes className="mr-1" /> Aktiv deyil
                            </span>
                          )}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <div>
                    <dl className="space-y-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Satıcı</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {ad.appUser?.fullName || ad.appUser?.userName || 'bilinmir'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Yaradılma Tarixi</dt>
                        <dd className="mt-1 text-sm text-gray-900">{formatDate(ad.createdAt)}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Məkan</dt>
                        <dd className="mt-1 text-sm text-gray-900">{ad.locationCityName || 'bilinmir'}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {ad.description && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Elan Açıqlaması</h3>
                    <div className="p-3 bg-gray-50 rounded-md max-h-40 overflow-y-auto">
                      <p className="text-sm text-gray-800 whitespace-pre-line">
                        {ad.description}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="font-semibold text-gray-800">Elan Məlumatları</h2>
              </div>
              <div className="p-5">
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <p className="text-yellow-700">Tapılmadı.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sağ Sütun - İşlemler */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-800">Əməliyyatlar</h2>
                {!isEditing && (
                  <button
                    onClick={toggleEditMode}
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    <FaPen className="mr-1" />
                    <span>Redaktə et</span>
                  </button>
                )}
              </div>
            </div>
            <div className="p-5">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Vəziyyət
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                      disabled={updateLoading}
                    >
                      <option value={ReportStatus.PENDING}>Gözləyir</option>
                      <option value={ReportStatus.UNDER_REVIEW}>Baxılır</option>
                      <option value={ReportStatus.RESOLVED}>Həll olunub</option>
                      <option value={ReportStatus.REJECTED}>İmtina olunub</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="reviewNotes" className="block text-sm font-medium text-gray-700 mb-1">
                    Qeydləri nəzərdən keçirin
                    </label>
                    <textarea
                      id="reviewNotes"
                      name="reviewNotes"
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      rows={5}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                      placeholder="qeyd yazın..."
                      disabled={updateLoading}
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={toggleEditMode}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      disabled={updateLoading}
                    >
                      <FaTimes className="mr-1.5" />
                      Ləğv et
                    </button>
                    <button
                      type="button"
                      onClick={handleUpdateStatus}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      disabled={updateLoading}
                    >
                      {updateLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saxlanılır...
                        </>
                      ) : (
                        <>
                          <FaSave className="mr-1.5" />
                          Saxla
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-5">
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Mevcut Durum</h3>
                    <div className="mt-2">{getStatusBadge(report.status)}</div>
                  </div>

                  <div className="space-y-4">
                    <button
                      onClick={() => {
                        setStatus(ReportStatus.UNDER_REVIEW);
                        setIsEditing(true);
                      }}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FaSyncAlt className="mr-1.5" />
                      Nəzərdən keçirin
                    </button>
                    
                    <button
                      onClick={() => {
                        setStatus(ReportStatus.RESOLVED);
                        setIsEditing(true);
                      }}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <FaCheck className="mr-1.5" />
                      Həll oldu olaraq işarələ
                    </button>
                    
                    <button
                      onClick={() => {
                        setStatus(ReportStatus.REJECTED);
                        setIsEditing(true);
                      }}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <FaBan className="mr-1.5" />
                      İmtina et
                    </button>
                  </div>
                  
                  <div className="mt-8 pt-5 border-t border-gray-200">
                    <button
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <FaTrashAlt className="mr-1.5 text-red-500" />
                      Şikayəti Sil
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          {/* Kullanıcıyı Blokla Kartı */}
          {ad?.appUser?.email && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="font-semibold text-gray-800 text-red-600">Kullanıcıyı Blokla</h2>
              </div>
              <div className="p-5">
                <div className="mb-2">
                  <span className="block text-xs text-gray-500 mb-1">Email</span>
                  <span className="block font-medium text-gray-800">{ad.appUser.email}</span>
                </div>
                <div className="mb-3">
                  <label className="block text-xs text-gray-500 mb-1">Bloklama səbəbi</label>
                  <input
                    type="text"
                    className="input input-bordered input-sm w-full"
                    value={blockReason}
                    onChange={e => setBlockReason(e.target.value)}
                    disabled={blockLoading}
                  />
                </div>
                <button
                  className="btn btn-error w-full"
                  onClick={handleBlockUser}
                  disabled={blockLoading}
                >
                  {blockLoading ? 'Bloklanır...' : 'Kullanıcıyı Blokla'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportDetail; 