import api from './api';

const logError = (methodName, error) => {
  console.error(`[ReportService] ${methodName} hatası:`, {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
    stack: error.stack
  });
};

const logInfo = (methodName, data) => {
  if (process.env.NODE_ENV === 'development') {
    console.info(`[ReportService] ${methodName}:`, data);
  }
};

// Report Reason enum values (must match backend)
export const REPORT_REASON = {
  OFFENSIVE: 0,
  FAKE: 1,
  SPAM: 2,
  INAPPROPRIATE: 3,
  SCAM: 4,
  DUPLICATE: 5,
  OTHER: 6
};

// Report Status enum values (must match backend)
export const REPORT_STATUS = {
  PENDING: 0,
  UNDER_REVIEW: 1,
  RESOLVED: 2,
  REJECTED: 3
};

const reportService = {
  // Kullanıcı bir ilanı raporlar
  createReport: async (reportData) => {
    try {
      const requestData = {
        adId: reportData.adId,
        appUserId: "00000000-0000-0000-0000-000000000000", // Kullanıcı ID'si kullanılmıyor
        reason: reportData.reason,
        description: reportData.description
      };

      logInfo('createReport.request', requestData);
      const response = await api.post('/Reports/CreateReport', requestData);
      logInfo('createReport.response', response.data);
      return response.data;
    } catch (error) {
      logError('createReport', error);
      throw new Error('Rapor gönderilirken bir hata oluştu: ' + (error.response?.data?.message || error.message));
    }
  },

  // Admin tüm raporları listeler (status parametresi opsiyonel)
  getAllReports: async (status = null) => {
    try {
      const url = status !== null 
        ? `/Reports/GetAllReports?status=${status}`
        : '/Reports/GetAllReports';
        
      logInfo('getAllReports.request', { status });
      const response = await api.get(url);
      logInfo('getAllReports.response', response.data);
      return response.data;
    } catch (error) {
      logError('getAllReports', error);
      throw new Error('Raporlar listelenirken bir hata oluştu: ' + (error.response?.data?.message || error.message));
    }
  },

  // Admin bir raporun detaylarını görüntüler
  getReportById: async (id) => {
    try {
      logInfo('getReportById.request', { id });
      const response = await api.get(`/Reports/GetReportById/${id}`);
      logInfo('getReportById.response', response.data);
      return response.data;
    } catch (error) {
      logError('getReportById', error);
      throw new Error('Rapor detayları alınırken bir hata oluştu: ' + (error.response?.data?.message || error.message));
    }
  },

  // Admin bir ilana ait tüm raporları listeler
  getReportsByAdId: async (adId) => {
    try {
      logInfo('getReportsByAdId.request', { adId });
      const response = await api.get(`/Reports/GetReportsByAdId/${adId}`);
      logInfo('getReportsByAdId.response', response.data);
      return response.data;
    } catch (error) {
      logError('getReportsByAdId', error);
      throw new Error('İlana ait raporlar listelenirken bir hata oluştu: ' + (error.response?.data?.message || error.message));
    }
  },

  // Admin bir raporun durumunu günceller
  updateReportStatus: async (reportData) => {
    try {
      const requestData = {
        reportId: reportData.reportId,
        appUserId: "00000000-0000-0000-0000-000000000000", // Kullanıcı ID'si kullanılmıyor
        status: reportData.status,
        reviewNotes: reportData.reviewNotes
      };

      logInfo('updateReportStatus.request', requestData);
      const response = await api.post('/Reports/UpdateReportStatus', requestData);
      logInfo('updateReportStatus.response', response.data);
      return response.data;
    } catch (error) {
      logError('updateReportStatus', error);
      throw new Error('Rapor durumu güncellenirken bir hata oluştu: ' + (error.response?.data?.message || error.message));
    }
  }
};

export default reportService; 