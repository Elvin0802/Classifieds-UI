import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import locationService from '../../../services/locationService';

function CreateLocation() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [parentLocations, setParentLocations] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    parentId: ''
  });

  // Üst lokasyonları getir
  useEffect(() => {
    const fetchParentLocations = async () => {
      try {
        const response = await locationService.getAllLocations();
        setParentLocations(response.data.items || []);
      } catch (error) {
        console.error('Üst lokasyonlar alınırken hata:', error);
        toast.error('Üst lokasyonlar yüklenirken bir hata oluştu.');
      }
    };
    
    fetchParentLocations();
  }, []);

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
      // Form verilerini hazırla - boş değerleri null yap
      const locationData = {
        ...formData,
        parentId: formData.parentId || null
      };
      
      await locationService.createLocation(locationData);
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
            {/* Lokasyon Adı */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Lokasyon Adı*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input input-bordered"
                placeholder="İl, ilçe veya mahalle adı"
                required
              />
            </div>
            
            {/* Lokasyon Kodu */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Lokasyon Kodu</span>
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className="input input-bordered"
                placeholder="Örn: 34 (İstanbul için)"
              />
            </div>
            
            {/* Üst Lokasyon */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Üst Lokasyon</span>
              </label>
              <select
                name="parentId"
                value={formData.parentId}
                onChange={handleChange}
                className="select select-bordered"
              >
                <option value="">Üst lokasyon yok (Ana lokasyon)</option>
                {parentLocations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
              <label className="label">
                <span className="label-text-alt text-gray-500">
                  İlçe için il, mahalle için ilçe seçin
                </span>
              </label>
            </div>
            
            {/* Açıklama */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Açıklama</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="textarea textarea-bordered h-24"
                placeholder="Lokasyon ile ilgili açıklama"
              ></textarea>
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