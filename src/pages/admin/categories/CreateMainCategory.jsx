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
    description: '',
    icon: '',
    order: 0,
    isActive: true,
    categoryId: ''
  });

  // Kategorileri getir
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getAllCategories();
        setCategories(response.data.items || []);
      } catch (error) {
        console.error('Kategoriler alınırken hata:', error);
        toast.error('Kategoriler yüklenirken bir hata oluştu.');
      }
    };
    
    fetchCategories();
  }, []);

  // Form verilerini güncelle
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prevData => ({
      ...prevData,
      [name]: newValue
    }));
  };

  // Ana kategori oluştur
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await categoryService.createMainCategory(formData);
      toast.success('Ana kategori başarıyla oluşturuldu.');
      navigate('/admin/categories');
    } catch (error) {
      console.error('Ana kategori oluşturulurken hata:', error);
      toast.error('Ana kategori oluşturulamadı. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Yeni Ana Kategori Oluştur</h1>
        <button 
          onClick={() => navigate('/admin/categories')}
          className="btn btn-outline btn-sm"
        >
          <FaArrowLeft className="mr-2" /> Geri Dön
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ana Kategori Adı */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Ana Kategori Adı*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input input-bordered"
                placeholder="Ana kategori adını girin"
                required
              />
            </div>
            
            {/* Üst Kategori */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Üst Kategori*</span>
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="select select-bordered"
                required
              >
                <option value="" disabled>Kategori seçin</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <label className="label">
                <span className="label-text-alt text-gray-500">
                  Ana kategorinin bağlı olacağı üst kategoriyi seçin
                </span>
              </label>
            </div>
            
            {/* İkon */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">İkon</span>
              </label>
              <input
                type="text"
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                className="input input-bordered"
                placeholder="icon-class veya URL"
              />
            </div>
            
            {/* Sıralama */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Sıralama</span>
              </label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                className="input input-bordered"
                min="0"
              />
            </div>
            
            {/* Aktif Mi? */}
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-4">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="checkbox checkbox-primary"
                />
                <span className="label-text font-medium">Aktif</span>
              </label>
              <label className="label mt-2">
                <span className="label-text-alt text-gray-500">
                  Ana kategori aktif olarak gösterilsin mi?
                </span>
              </label>
            </div>
            
            {/* Açıklama */}
            <div className="form-control md:col-span-2">
              <label className="label">
                <span className="label-text font-medium">Açıklama</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="textarea textarea-bordered h-32"
                placeholder="Ana kategori ile ilgili açıklama"
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
              Ana Kategori Oluştur
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateMainCategory; 