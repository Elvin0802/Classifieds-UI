import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import categoryService from '../../../services/categoryService';

function CreateMainCategory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    parentCategoryId: ''
  });

  // Kategorileri getir
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getAllCategories();
        setCategories(response.data.items || []);
      } catch (error) {
        console.error('Kategoriler alınırken hata:', error);
        toast.error('xəta');
      }
    };
    
    fetchCategories();
  }, []);

  // Form verilerini güncelle
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Ana kategori oluştur
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await categoryService.createMainCategory(formData);
      toast.success('Yaradıldı.');
      navigate('/admin/categories');
    } catch (error) {
      console.error('Ana kategori oluşturulurken hata:', error);
      toast.error('xəta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Yeni Əsas Kategoriya Yarat</h1>
        <button 
          onClick={() => navigate('/admin/categories')}
          className="btn btn-outline btn-sm"
        >
          <FaArrowLeft className="mr-2" /> Geri
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ana Kategori Adı */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Əsas Kategoriya Adı*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input input-bordered"
                placeholder="Əsas kategoriya adı"
                required
              />
            </div>
            
            {/* Üst Kategori */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Kategoriya*</span>
              </label>
              <select
                name="parentCategoryId"
                value={formData.parentCategoryId}
                onChange={handleChange}
                className="select select-bordered"
                required
              >
                <option value="" disabled>Kategoriya seçin</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <label className="label">
                <span className="label-text-alt text-gray-500">
                  Əsas Kategoriyanı Seçin
                </span>
              </label>
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
              Əsas Kategoriya Yarat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateMainCategory; 