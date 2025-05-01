import React, { useState, useEffect } from 'react';
import { FaEye, FaFilter, FaSearch, FaChevronLeft, FaChevronRight, FaArrowRight, FaArrowLeft, FaSyncAlt, FaExclamationTriangle, FaCheck, FaClock, FaBan } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import reportService from '../../../services/reportService';

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

const ReportsList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filter, setFilter] = useState({
    status: '',
    reason: '',
    searchTerm: ''
  });

  useEffect(() => {
    fetchReports();
  }, [currentPage, pageSize]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // API üzerinden raporları getir
      const response = await reportService.getAllReports(filter.status || null);
      
      if (response && response.isSucceeded) {
        // API yanıtından verileri ayıkla
        const { items, pageNumber, pageSize, totalCount, totalPages } = response.data || {};
        
        setReports(items || []);
        setCurrentPage(pageNumber || 1);
        setPageSize(pageSize || 10);
        setTotalCount(totalCount || 0);
        setTotalPages(totalPages || 1);
      } else {
        setError(response?.message || 'Raporlar alınırken bir hata oluştu');
        toast.error(response?.message || 'Raporlar alınırken bir hata oluştu');
      }
    } catch (err) {
      console.error('Raporlar yüklenirken hata:', err);
      setError('Raporlar yüklenirken bir hata oluştu');
      toast.error('Raporlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Aramada ilk sayfaya dön
    fetchReports();
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  const resetFilters = () => {
    setFilter({
      status: '',
      reason: '',
      searchTerm: ''
    });
    setCurrentPage(1);
    // Filtreleri sıfırladıktan sonra veriyi yenile
    fetchReports();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case ReportStatus.PENDING:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><FaClock className="mr-1" /> Beklemede</span>;
      case ReportStatus.UNDER_REVIEW:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><FaSyncAlt className="mr-1" /> İnceleniyor</span>;
      case ReportStatus.RESOLVED:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><FaCheck className="mr-1" /> Çözüldü</span>;
      case ReportStatus.REJECTED:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><FaBan className="mr-1" /> Reddedildi</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Bilinmiyor</span>;
    }
  };

  const getReasonText = (reason) => {
    switch (reason) {
      case ReportReason.INAPPROPRIATE:
        return 'Uygunsuz İçerik';
      case ReportReason.MISLEADING:
        return 'Yanıltıcı Bilgi';
      case ReportReason.FRAUDULENT:
        return 'Dolandırıcılık';
      case ReportReason.DUPLICATE:
        return 'Mükerrer İlan';
      case ReportReason.WRONG_CATEGORY:
        return 'Yanlış Kategori';
      case ReportReason.SPAM:
        return 'Spam';
      case ReportReason.OTHER:
        return 'Diğer';
      default:
        return 'Bilinmiyor';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Rapor Yönetimi</h1>
        <button 
          onClick={() => fetchReports()}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          <FaSyncAlt />
          <span>Yenile</span>
        </button>
      </div>

      {/* Filtreler */}
      <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
        <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="font-medium text-gray-700 flex items-center">
            <FaFilter className="mr-2 text-gray-500" /> Filtreler
          </h2>
        </div>
        <div className="p-5">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
              <select
                name="status"
                value={filter.status}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="">Tümü</option>
                <option value={ReportStatus.PENDING}>Beklemede</option>
                <option value={ReportStatus.UNDER_REVIEW}>İnceleniyor</option>
                <option value={ReportStatus.RESOLVED}>Çözüldü</option>
                <option value={ReportStatus.REJECTED}>Reddedildi</option>
              </select>
            </div>
            
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Rapor Nedeni</label>
              <select
                name="reason"
                value={filter.reason}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="">Tümü</option>
                <option value={ReportReason.INAPPROPRIATE}>Uygunsuz İçerik</option>
                <option value={ReportReason.MISLEADING}>Yanıltıcı Bilgi</option>
                <option value={ReportReason.FRAUDULENT}>Dolandırıcılık</option>
                <option value={ReportReason.DUPLICATE}>Mükerrer İlan</option>
                <option value={ReportReason.WRONG_CATEGORY}>Yanlış Kategori</option>
                <option value={ReportReason.SPAM}>Spam</option>
                <option value={ReportReason.OTHER}>Diğer</option>
              </select>
            </div>
            
            <div className="md:col-span-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Arama</label>
              <div className="flex">
                <input
                  type="text"
                  name="searchTerm"
                  placeholder="İlan başlığı, kullanıcı adı veya açıklama"
                  value={filter.searchTerm}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-r-md hover:bg-primary/90 transition-colors"
                >
                  <FaSearch />
                </button>
              </div>
            </div>

            <div className="md:col-span-12 flex justify-end">
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Filtreleri Sıfırla
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Rapor Listesi */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 my-6">
          <div className="flex">
            <FaExclamationTriangle className="h-5 w-5 text-red-500 mr-3" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 my-6">
          <div className="flex justify-center text-blue-700">
            Gösterilecek rapor bulunamadı
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İlan Bilgileri
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Raporlayan
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Neden
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                          {report.adTitle || `İlan #${report.adId}`}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          ID: {report.adId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {report.reportedByUserName || 'İsimsiz Kullanıcı'}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {report.reportedByUserId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getReasonText(report.reason)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(report.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(report.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/admin/reports/${report.id}`}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <FaEye className="mr-1" />
                          <span>Görüntüle</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sayfalama */}
          <div className="flex items-center justify-between bg-white px-4 py-3 mt-4 rounded-lg shadow-md">
            <div className="text-sm text-gray-700">
              <span>Toplam {totalCount} rapordan </span>
              <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span>
              <span> - </span>
              <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span>
              <span> arası gösteriliyor</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  currentPage === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FaArrowLeft className="h-3 w-3" />
                <span className="ml-1">İlk</span>
              </button>
              
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  currentPage === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FaChevronLeft className="h-3 w-3" />
                <span className="ml-1">Önceki</span>
              </button>
              
              <div className="hidden md:flex">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Toplam 5 sayfa veya daha az görüntüle, 5'ten fazla ise current etrafında göster
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else {
                    const startPage = Math.max(1, currentPage - 2);
                    const endPage = Math.min(totalPages, startPage + 4);
                    pageNum = startPage + i;
                    
                    if (pageNum > endPage) return null;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                        currentPage === pageNum
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      } border rounded-md mx-1`}
                    >
                      {pageNum}
                    </button>
                  );
                }).filter(Boolean)}
              </div>
              
              <div className="flex md:hidden">
                <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium border border-gray-300 bg-white text-gray-700 rounded-md">
                  {currentPage} / {totalPages}
                </span>
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  currentPage === totalPages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="mr-1">Sonraki</span>
                <FaChevronRight className="h-3 w-3" />
              </button>
              
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  currentPage === totalPages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="mr-1">Son</span>
                <FaArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportsList; 