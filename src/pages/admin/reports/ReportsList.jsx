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
  const [filter, setFilter] = useState({
    status: '',
    reason: ''
  });
  const [allReports, setAllReports] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      // API üzerinden TÜM raporları getir
      const response = await reportService.getAllReports();
      if (response && response.isSucceeded) {
        const { items } = response.data || {};
        setAllReports(items || []);
        setReports(items || []);
        setCurrentPage(1);
      } else {
        setError(response?.message || 'xəta');
        toast.error(response?.message || 'xəta');
      }
    } catch (err) {
      console.error('Raporlar yüklenirken hata:', err);
      setError('xəta');
      toast.error('xəta');
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
    setCurrentPage(1);
  };

  // Filtreleme sadece frontend'de yapılacak
  useEffect(() => {
    let filtered = allReports;
    if (filter.status !== '') {
      filtered = filtered.filter(r => String(r.status) === String(filter.status));
    }
    if (filter.reason !== '') {
      filtered = filtered.filter(r => String(r.reason) === String(filter.reason));
    }
    setReports(filtered);
    setCurrentPage(1);
  }, [filter, allReports]);

  const resetFilters = () => {
    setFilter({
      status: '',
      reason: ''
    });
    setCurrentPage(1);
  };

  // Sayfalama işlemi frontend'de
  const totalCount = reports.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const paginatedReports = reports.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case ReportStatus.PENDING:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><FaClock className="mr-1" /> Gözləyir</span>;
      case ReportStatus.UNDER_REVIEW:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><FaSyncAlt className="mr-1" /> Nəzərdən keçirilir</span>;
      case ReportStatus.RESOLVED:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><FaCheck className="mr-1" /> Həll olunub</span>;
      case ReportStatus.REJECTED:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><FaBan className="mr-1" /> Rədd olunub</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Bilinmiyor</span>;
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Şikayət İdarəetməsi</h1>
        <button 
          onClick={() => fetchReports()}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          <FaSyncAlt />
          <span>Yenilə</span>
        </button>
      </div>

      {/* Filtreler */}
      <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
        <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="font-medium text-gray-700 flex items-center">
            <FaFilter className="mr-2 text-gray-500" /> Filtrlər
          </h2>
        </div>
        <div className="p-5">
          <form className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Vəziyyət</label>
              <select
                name="status"
                value={filter.status}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="">Hamısı</option>
                <option value={ReportStatus.PENDING}>Gözləyir</option>
                <option value={ReportStatus.UNDER_REVIEW}>Nəzərdən keçirilir</option>
                <option value={ReportStatus.RESOLVED}>Həll olunub</option>
                <option value={ReportStatus.REJECTED}>İmtina olunub</option>
              </select>
            </div>
            
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Şikayət səbəbi</label>
              <select
                name="reason"
                value={filter.reason}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="">Tümü</option>
                <option value={ReportReason.INAPPROPRIATE}>Uyğun olmayan Məzmun</option>
                <option value={ReportReason.MISLEADING}>Yanlış məlumat</option>
                <option value={ReportReason.FRAUDULENT}>Fırıldaqçılıq</option>
                <option value={ReportReason.DUPLICATE}>Dublikat Elan</option>
                <option value={ReportReason.WRONG_CATEGORY}>Yanlış Kategoriya</option>
                <option value={ReportReason.SPAM}>Spam</option>
                <option value={ReportReason.OTHER}>Digər</option>
              </select>
            </div>
            <div className="md:col-span-12 flex justify-end">
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Filtrləri Sıfırla
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
            Göstəriləcək Şikayət Tapılmadı.
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
                      Elan məlumatları
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Şikayət edən
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Səbəb
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vəziyyət
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarix
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Əməliyyatlar
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedReports.map((report) => (
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
                          <span>Bax</span>
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
              <span>Cəmi {totalCount} Şikayətdən </span>
              <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span>
              <span> - </span>
              <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span>
              <span> göstərlir</span>
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
                <span className="ml-1">Öncəki</span>
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