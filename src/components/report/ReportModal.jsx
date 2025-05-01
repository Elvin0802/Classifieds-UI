import { useState } from 'react';
import { FaFlag, FaTimes, FaExclamationTriangle, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import reportService from '../../services/reportService';

const ReportModal = ({ adId, adTitle, isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Form, 2: Başarılı, 3: Hata
  const [formData, setFormData] = useState({
    adId: adId,
    reason: 0, // Varsayılan olarak "Uygunsuz İçerik"
    description: ''
  });

  // API'ye uygun olarak güncellendi
  const reportReasons = [
    { value: 0, label: 'Uyğun olmayan Məzmun' },
    { value: 1, label: 'Səhv / Saxta Məlumat' },
    { value: 2, label: 'Fırıldaqçılıq / Saxtakarlıq' },
    { value: 3, label: 'Dublikat Reklam' },
    { value: 4, label: 'Səhv Kateqoriya' },
    { value: 5, label: 'Spam' },
    { value: 6, label: 'Diger' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Reason enum değerini sayı olarak ayarlamak için
    if (name === 'reason') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.reason === undefined || formData.reason === null) {
      toast.error('Zəhmət olmasa şikayətinizin səbəbini seçin');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await reportService.createReport(formData);
      
      if (response && response.isSucceeded) {
        setStep(2); // Başarılı adıma geç
      } else {
        setStep(3); // Hata adımına geç
        console.error('Rapor oluşturma hatası:', response?.message);
      }
    } catch (error) {
      console.error('İlan raporlanırken hata:', error);
      setStep(3); // Hata adımına geç
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Modalı kapatırken formu sıfırla
    setFormData({
      adId: adId,
      reason: 0,
      description: ''
    });
    setStep(1);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-fadeIn">
        {/* Header */}
        <div className="p-5 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FaFlag className="text-red-500" />
              {step === 1 ? 'Elan şikayət et' : step === 2 ? 'Şikayət Göndərildi' : 'Şikayət Göndəriləmədi'}
            </h2>
            <button 
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Bağla"
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {step === 1 && (
            <>
              <p className="text-sm text-gray-600 mb-4">
              Bu elanı niyə şikayət etmək istədiyinizi seçin. Hesabatınız və elan moderatorlarımız tərəfindən nəzərdən keçiriləcək.
              </p>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Şikayət etdiyiniz elan
                    </label>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-800">
                      {adTitle || 'Elan #' + adId}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Şikayət Səbəbi <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      required
                    >
                      {reportReasons.map(reason => (
                        <option key={reason.value} value={reason.value}>
                          {reason.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ətraflı Açıqlama
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Zəhmət olmasa şikayətinizlə bağlı ətraflı məlumat verin...."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      rows={5}
                    ></textarea>
                    <p className="mt-1 text-xs text-gray-500">
                    Daha sürətli nəzərdən keçirmək üçün problemi mümkün qədər ətraflı təsvir edin.
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    İmtina et
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 border border-transparent rounded-md text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Emal olunur...</span>
                      </>
                    ) : (
                      <>
                        <FaFlag size={14} />
                        <span>Şikayət Et</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}

          {step === 2 && (
            <div className="text-center py-5">
              <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-green-100 mb-4">
                <FaCheck className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Şikayət Göndərildi</h3>
              <p className="text-sm text-gray-600 mb-5">
              Şikayətiniz üçün təşəkkür edirik. Moderatorlarımız onu ən qısa zamanda nəzərdən keçirəcək.
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="w-full px-4 py-2 bg-primary hover:bg-primary/90 border border-transparent rounded-md text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Bağla
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-5">
              <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-100 mb-4">
                <FaExclamationTriangle className="h-7 w-7 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Şikayət Göndəriləmədi</h3>
              <p className="text-sm text-gray-600 mb-5">
              Bağışlayın, hesabatınızı göndərərkən xəta baş verdi. Lütfən, sonra yenidən cəhd edin.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Bağla
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 border border-transparent rounded-md text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Yenidən cəhd et
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ReportModal.propTypes = {
  adId: PropTypes.string.isRequired,
  adTitle: PropTypes.string,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default ReportModal; 