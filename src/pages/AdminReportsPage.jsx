import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportService } from '../services';
import { REPORT_REASON, REPORT_STATUS } from '../services/reportService';
import { Loading } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes, FaEye, FaFilter, FaChevronRight, FaChevronDown, FaExclamationTriangle } from 'react-icons/fa';

const AdminReportsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' veya 'detail'
  const [filterStatus, setFilterStatus] = useState(REPORT_STATUS.PENDING);
  const [expandedReport, setExpandedReport] = useState(null);
  const [updateForm, setUpdateForm] = useState({
    status: REPORT_STATUS.RESOLVED,
    reviewNotes: ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    // Yetki kontrolü
    if (!authLoading && (!isAuthenticated || !isAdmin())) {
      toast.error('Bu sayfaya erişim izniniz yok!');
      navigate('/');
      return;
    }

    fetchReports();
  }, [authLoading, isAuthenticated, isAdmin, navigate, filterStatus]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await reportService.getAllReports(filterStatus);
      setReports(response.items || []);
    } catch (error) {
      toast.error('Raporlar yüklenirken bir hata oluştu.');
      console.error('Raporlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReportReasonText = (reasonCode) => {
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
        return 'Bilinmeyen';
    }
  };

  const getReportStatusText = (statusCode) => {
    switch (statusCode) {
      case REPORT_STATUS.PENDING:
        return 'Beklemede';
      case REPORT_STATUS.UNDER_REVIEW:
        return 'İnceleniyor';
      case REPORT_STATUS.RESOLVED:
        return 'Çözüldü';
      case REPORT_STATUS.REJECTED:
        return 'Reddedildi';
      default:
        return 'Bilinmeyen';
    }
  };

  const getReportStatusColor = (statusCode) => {
    switch (statusCode) {
      case REPORT_STATUS.PENDING:
        return 'text-yellow-500';
      case REPORT_STATUS.UNDER_REVIEW:
        return 'text-blue-500';
      case REPORT_STATUS.RESOLVED:
        return 'text-green-500';
      case REPORT_STATUS.REJECTED:
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleViewReport = async (report) => {
    setSelectedReport(report);
    setViewMode('detail');
    setUpdateForm({
      status: report.status,
      reviewNotes: report.reviewNotes || ''
    });
  };

  const handleToggleExpand = (reportId) => {
    setExpandedReport(expandedReport === reportId ? null : reportId);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    
    if (!selectedReport) return;
    
    try {
      setUpdateLoading(true);
      
      const response = await reportService.updateReportStatus({
        reportId: selectedReport.id,
        status: updateForm.status,
        reviewNotes: updateForm.reviewNotes
      });
      
      if (response.isSucceeded) {
        toast.success('Rapor durumu güncellendi.');
        setViewMode('list');
        fetchReports();
      } else {
        toast.error('Rapor durumu güncellenirken bir hata oluştu.');
      }
    } catch (error) {
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
      console.error('Rapor güncellenirken hata:', error);
    } finally {
      setUpdateLoading(false);
    }
  };

  if (authLoading) {
    return <Loading fullScreen />;
  }

  if (loading && reports.length === 0) {
    return <Loading fullScreen />;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          İlan Raporları
          {viewMode === 'detail' && (
            <span className="ml-2">
              <button 
                onClick={() => setViewMode('list')}
                className="text-blue-500 text-sm hover:underline"
              >
                Listeye Dön
              </button>
            </span>
          )}
        </h1>
        
        {viewMode === 'list' && (
          <div className="flex items-center">
            <FaFilter className="mr-2 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(parseInt(e.target.value))}
              className="border rounded-md py-1 px-3"
            >
              <option value={REPORT_STATUS.PENDING}>Beklemede</option>
              <option value={REPORT_STATUS.UNDER_REVIEW}>İnceleniyor</option>
              <option value={REPORT_STATUS.RESOLVED}>Çözüldü</option>
              <option value={REPORT_STATUS.REJECTED}>Reddedildi</option>
            </select>
          </div>
        )}
      </div>

      {viewMode === 'list' ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {reports.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Bu durumda rapor bulunmuyor.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İlan Bilgisi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rapor Nedeni
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rapor Zamanı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.map((report) => {
                    return (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {report.adTitle || 'İsimsiz İlan'}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {report.adId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {getReportReasonText(report.reason)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(report.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getReportStatusColor(report.status)}`}>
                          {getReportStatusText(report.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewReport(report)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => handleToggleExpand(report.id)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            {expandedReport === report.id ? <FaChevronDown /> : <FaChevronRight />}
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {/* Genişletilmiş rapor detayı */}
              {expandedReport && (
                <div className="p-4 bg-gray-50 border-t">
                  {(() => {
                    const report = reports.find(r => r.id === expandedReport);
                    if (!report) return null;
                    
                    return (
                      <div>
                        <h3 className="font-medium mb-2">Rapor Detayları</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm"><span className="font-medium">Bildiren Kullanıcı:</span> {report.reportedByUserName || 'Bilinmiyor'}</p>
                            <p className="text-sm"><span className="font-medium">Açıklama:</span> {report.description || 'Açıklama yok'}</p>
                          </div>
                          <div>
                            {report.reviewedAt && (
                              <>
                                <p className="text-sm"><span className="font-medium">İnceleyen:</span> {report.reviewedByUserName || 'Bilinmiyor'}</p>
                                <p className="text-sm"><span className="font-medium">İnceleme Notları:</span> {report.reviewNotes || 'Not yok'}</p>
                                <p className="text-sm"><span className="font-medium">İnceleme Tarihi:</span> {formatDate(report.reviewedAt)}</p>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 flex space-x-2">
                          <button
                            onClick={() => handleViewReport(report)}
                            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                          >
                            Detaylı İncele
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        // Rapor detay görünümü
        selectedReport && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Rapor Bilgileri</h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">Rapor ID:</span>
                    <p className="text-gray-700">{selectedReport.id}</p>
                  </div>
                  <div>
                    <span className="font-medium">Rapor Zamanı:</span>
                    <p className="text-gray-700">{formatDate(selectedReport.createdAt)}</p>
                  </div>
                  <div>
                    <span className="font-medium">Bildiren Kullanıcı:</span>
                    <p className="text-gray-700">{selectedReport.reportedByUserName}</p>
                  </div>
                  <div>
                    <span className="font-medium">Neden:</span>
                    <p className="text-gray-700">{getReportReasonText(selectedReport.reason)}</p>
                  </div>
                  <div>
                    <span className="font-medium">Açıklama:</span>
                    <p className="text-gray-700 whitespace-pre-line">{selectedReport.description || 'Açıklama yok'}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">İlan Bilgileri</h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">İlan Başlığı:</span>
                    <p className="text-gray-700">{selectedReport.adTitle || 'Başlık yok'}</p>
                  </div>
                  <div>
                    <span className="font-medium">İlan ID:</span>
                    <p className="text-gray-700">{selectedReport.adId}</p>
                  </div>
                  <button
                    onClick={() => window.open(`/ads/${selectedReport.adId}`, '_blank')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    İlanı Görüntüle
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Durum Güncelleme</h3>
              <form onSubmit={handleUpdateStatus}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Durum</label>
                    <select
                      value={updateForm.status}
                      onChange={(e) => setUpdateForm({...updateForm, status: parseInt(e.target.value)})}
                      className="w-full border rounded-md py-2 px-3 text-gray-700"
                      required
                    >
                      <option value={REPORT_STATUS.PENDING}>Beklemede</option>
                      <option value={REPORT_STATUS.UNDER_REVIEW}>İnceleniyor</option>
                      <option value={REPORT_STATUS.RESOLVED}>Çözüldü</option>
                      <option value={REPORT_STATUS.REJECTED}>Reddedildi</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">İnceleme Notları</label>
                    <textarea
                      value={updateForm.reviewNotes}
                      onChange={(e) => setUpdateForm({...updateForm, reviewNotes: e.target.value})}
                      className="w-full border rounded-md py-2 px-3 text-gray-700"
                      rows={4}
                      placeholder="Raporla ilgili notlarınızı girin"
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      disabled={updateLoading}
                    >
                      {updateLoading ? 'Güncelleniyor...' : 'Güncelle'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default AdminReportsPage; 