import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import locationService from '../../../services/locationService';

function CreateLocation() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    city: '',
    country: 'Türkiye'
  });

  // Form verilerini güncelle
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Lokasyon oluştur
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await locationService.create(formData);
      toast.success('Lokasyon başarıyla oluşturuldu.');
      navigate('/admin/locations');
    } catch (error) {
      console.error('Lokasyon oluşturulurken hata:', error);
      toast.error('Lokasyon oluşturulamadı. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Yeni Lokasyon Oluştur</h1>
        <button 
          onClick={() => navigate('/admin/locations')}
          className="btn btn-outline btn-sm"
        >
          <FaArrowLeft className="mr-2" /> Geri Dön
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Şehir */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Şehir*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="input input-bordered"
                placeholder="Şehir adını girin"
                required
              />
            </div>
            
            {/* Ülke */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Ülke*</span>
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="input input-bordered"
                placeholder="Ülke adını girin"
                required
              />
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                <FaSave className="mr-2" />
              )}
              Lokasyon Oluştur
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateLocation; 