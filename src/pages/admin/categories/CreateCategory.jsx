import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import categoryService from '../../../services/categoryService';

function CreateCategory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: ''
  });

  // Form verilerini güncelle
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Kategori oluştur
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await categoryService.createCategory(formData);
      toast.success('yaradıldı.');
      navigate('/admin/categories');
    } catch (error) {
      console.error('Kategori oluşturulurken hata:', error);
      toast.error('error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Yeni Kategoriya Yarat</h1>
        <button 
          onClick={() => navigate('/admin/categories')}
          className="btn btn-outline btn-sm"
        >
          <FaArrowLeft className="mr-2" /> Geri
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit}>
          {/* Kategori Adı */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Kategoriya Adı*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input input-bordered"
              placeholder="Kategoriya adını yazın"
              required
            />
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
              Kategoriya Yarat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCategory; 