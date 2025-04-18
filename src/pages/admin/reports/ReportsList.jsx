import React, { useState, useEffect } from 'react';
import { FaEye, FaFilter, FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import moment from 'moment';
import reportService from '../../../services/reportService';

const ReportsList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalReports, setTotalReports] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filter, setFilter] = useState({
    status: '',
    reason: '',
    searchTerm: ''
  });

  // Sayfalama için toplam sayfa sayısını hesapla
  const totalPages = Math.ceil(totalReports / pageSize);

  useEffect(() => {
    fetchReports();
  }, [currentPage, pageSize, filter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      // API üzerinden raporları getir
      const response = await reportService.getAllReports({
        page: currentPage,
        pageSize: pageSize,
        status: filter.status || undefined,
        reason: filter.reason || undefined,
        searchTerm: filter.searchTerm || undefined
      });
      
      setReports(response.items || []);
      setTotalReports(response.totalItems || 0);
      setLoading(false);
    } catch (err) {
      console.error('Raporlar yüklenirken hata:', err);
      setError('Raporlar yüklenirken bir hata oluştu.');
      setLoading(false);
      toast.error('Raporlar yüklenirken bir hata oluştu.');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1); // Filtre değiştiğinde ilk sayfaya dön
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReports();
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

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

  const formatDate = (dateString) => {
    return moment(dateString).format('DD.MM.YYYY HH:mm');
  };

  const resetFilters = () => {
    setFilter({
      status: '',
      reason: '',
      searchTerm: ''
    });
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto py-4 px-4">
      <h1 className="mb-4 text-2xl font-bold">Rapor Yönetimi</h1>

      {/* Filtre Paneli */}
      <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b">
          <h5 className="m-0 font-medium flex items-center"><FaFilter className="mr-2" />Filtreler</h5>
        </div>
        <div className="p-4">
          <form onSubmit={handleSearchSubmit}>
            <div className="grid md:grid-cols-12 gap-4 mb-4">
              <div className="md:col-span-3">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
                  <select
                    name="status"
                    value={filter.status}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Tümü</option>
                    <option value="PENDING">Beklemede</option>
                    <option value="UNDER_REVIEW">İnceleniyor</option>
                    <option value="RESOLVED">Çözüldü</option>
                    <option value="REJECTED">Reddedildi</option>
                  </select>
                </div>
              </div>
              <div className="md:col-span-3">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rapor Nedeni</label>
                  <select
                    name="reason"
                    value={filter.reason}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Tümü</option>
                    <option value="INAPPROPRIATE_CONTENT">Uygunsuz İçerik</option>
                    <option value="FAKE_AD">Sahte İlan</option>
                    <option value="SPAM">Spam</option>
                    <option value="WRONG_CATEGORY">Yanlış Kategori</option>
                    <option value="SCAM">Dolandırıcılık</option>
                    <option value="OTHER">Diğer</option>
                  </select>
                </div>
              </div>
              <div className="md:col-span-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ara</label>
                  <div className="flex">
                    <input
                      type="text"
                      name="searchTerm"
                      placeholder="İlan ID, açıklama veya kullanıcı ID"
                      value={filter.searchTerm}
                      onChange={handleFilterChange}
                      className="flex-grow border border-gray-300 rounded-l-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2">
                      <FaSearch />
                    </button>
                    <button type="button" className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 ml-2 rounded-r-md" onClick={resetFilters}>
                      Sıfırla
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Rapor Tablosu */}
      {loading ? (
        <div className="text-center py-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent">
            <span className="sr-only">Yükleniyor...</span>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4">
          Rapor bulunamadı.
        </div>
      ) : (
        <>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İlan ID</th>
                <th>ID</th>
                <th>İlan ID</th>
                <th>Neden</th>
                <th>Durum</th>
                <th>Raporlayan</th>
                <th>Tarih</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(report => (
                <tr key={report.id}>
                  <td>{report.id}</td>
                  <td>{report.adId}</td>
                  <td>{getReasonText(report.reason)}</td>
                  <td>{getStatusBadge(report.status)}</td>
                  <td>{report.userId || 'Bilinmiyor'}</td>
                  <td>{formatDate(report.createdAt)}</td>
                  <td>
                    <Link to={`/admin/reports/${report.id}`}>
                      <Button variant="info" size="sm">
                        <FaEye className="me-1" /> Görüntüle
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Sayfalama */}
          <div className="d-flex justify-content-between align-items-center">
            <div>
              Toplam {totalReports} rapordan {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalReports)} arası gösteriliyor
            </div>
            
            <Pagination>
              <Pagination.First 
                onClick={() => handlePageChange(1)} 
                disabled={currentPage === 1}
              />
              <Pagination.Prev 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1}
              />
              
              {[...Array(Math.min(5, totalPages))].map((_, index) => {
                const pageNumber = currentPage <= 3 
                  ? index + 1 
                  : currentPage >= totalPages - 2 
                    ? totalPages - 4 + index 
                    : currentPage - 2 + index;
                
                if (pageNumber > 0 && pageNumber <= totalPages) {
                  return (
                    <Pagination.Item 
                      key={pageNumber}
                      active={pageNumber === currentPage}
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </Pagination.Item>
                  );
                }
                return null;
              })}
              
              <Pagination.Next 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
              />
              <Pagination.Last 
                onClick={() => handlePageChange(totalPages)} 
                disabled={currentPage === totalPages}
              />
            </Pagination>
            
            <Form.Select 
              style={{ width: '80px' }} 
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </Form.Select>
          </div>
        </>
      )}
    </Container>
  );
};

export default ReportsList; 