import { useState } from 'react';
import { FaFlag, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import reportService from '../../services/reportService';

function ReportAdForm({ adId, onClose }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    adId: adId,
    reason: '',
    description: ''
  });

  const reportReasons = [
    { value: 'inappropriate', label: 'Uygunsuz İçerik' },
    { value: 'spam', label: 'Spam veya Yanıltıcı' },
    { value: 'duplicate', label: 'Mükerrer İlan' },
    { value: 'fraud', label: 'Dolandırıcılık' },
    { value: 'wrong_category', label: 'Yanlış Kategori' },
    { value: 'fake_photos', label: 'Sahte Fotoğraflar' },
    { value: 'other', label: 'Diğer' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.reason) {
      toast.error('Lütfen bir şikayet nedeni seçin');
      return;
    }
    
    setLoading(true);
    
    try {
      await reportService.createReport(formData);
      toast.success('İlan başarıyla raporlandı. Teşekkür ederiz.');
      onClose();
    } catch (error) {
      console.error('İlan raporlanırken hata:', error);
      toast.error('İlan raporlanırken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center">
            <FaFlag className="text-red-500 mr-2" /> İlanı Raporla
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Şikayet Nedeni*
            </label>
            <select
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className="select select-bordered w-full"
              required
            >
              <option value="" disabled>Bir neden seçin</option>
              {reportReasons.map(reason => (
                <option key={reason.value} value={reason.value}>
                  {reason.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Açıklama
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="textarea textarea-bordered w-full h-32"
              placeholder="Lütfen şikayetinizle ilgili daha fazla bilgi verin"
            ></textarea>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline btn-sm mr-2"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="btn btn-error btn-sm"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <FaFlag className="mr-1" />
              )}
              Raporla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReportAdForm; 