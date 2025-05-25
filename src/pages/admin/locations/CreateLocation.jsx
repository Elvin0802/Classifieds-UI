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
    country: 'Azerbaijan'
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
      toast.success('məkan yarandı.');
      navigate('/admin/locations');
    } catch (error) {
      console.error('Lokasyon oluşturulurken hata:', error);
      toast.error('xəta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Yeni Məkan Yarat</h1>
        <button 
          onClick={() => navigate('/admin/locations')}
          className="btn btn-outline btn-sm"
        >
          <FaArrowLeft className="mr-2" /> Geri
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Şehir */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Şəhər*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="input input-bordered"
                placeholder="Şəhər adı"
                required
              />
            </div>
            
            {/* Ülke */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Ölkə*</span>
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="input input-bordered"
                placeholder="Ölkə adı"
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
              Məkan Yarat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateLocation; 