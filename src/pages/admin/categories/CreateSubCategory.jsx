import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import categoryService from '../../../services/categoryService';

function CreateSubCategory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    order: 0,
    isActive: true,
    mainCategoryId: '',
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

  // Kategori değiştiğinde ana kategorileri getir
  useEffect(() => {
    if (!selectedCategory) {
      setMainCategories([]);
      return;
    }

    const fetchMainCategories = async () => {
      try {
        const response = await categoryService.getMainCategoriesByCategoryId(selectedCategory);
        setMainCategories(response.data.items || []);
        
        // Ana kategoriler değiştiğinde formda seçili ana kategoriyi temizle
        setFormData(prev => ({
          ...prev,
          mainCategoryId: ''
        }));
      } catch (error) {
        console.error('Ana kategoriler alınırken hata:', error);
        toast.error('Ana kategoriler yüklenirken bir hata oluştu.');
      }
    };

    fetchMainCategories();
  }, [selectedCategory]);

  // Form verilerini güncelle
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prevData => ({
      ...prevData,
      [name]: newValue
    }));

    // Kategori değiştiğinde state'i güncelle
    if (name === 'categoryId') {
      setSelectedCategory(value);
    }
  };

  // Alt kategori oluştur
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await categoryService.createSubCategory(formData);
      toast.success('Alt kategori başarıyla oluşturuldu.');
      navigate('/admin/categories');
    } catch (error) {
      console.error('Alt kategori oluşturulurken hata:', error);
      toast.error('Alt kategori oluşturulamadı. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Yeni Alt Kategori Oluştur</h1>
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
            {/* Alt Kategori Adı */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Alt Kategori Adı*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input input-bordered"
                placeholder="Alt kategori adını girin"
                required
              />
            </div>
            
            {/* Kategori */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Kategori*</span>
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
            </div>
            
            {/* Ana Kategori */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Ana Kategori*</span>
              </label>
              <select
                name="mainCategoryId"
                value={formData.mainCategoryId}
                onChange={handleChange}
                className="select select-bordered"
                required
                disabled={!selectedCategory}
              >
                <option value="" disabled>Ana kategori seçin</option>
                {mainCategories.map(mainCategory => (
                  <option key={mainCategory.id} value={mainCategory.id}>
                    {mainCategory.name}
                  </option>
                ))}
              </select>
              {!selectedCategory && (
                <label className="label">
                  <span className="label-text-alt text-gray-500">
                    Önce bir kategori seçmelisiniz
                  </span>
                </label>
              )}
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
                  Alt kategori aktif olarak gösterilsin mi?
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
                placeholder="Alt kategori ile ilgili açıklama"
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
              Alt Kategori Oluştur
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateSubCategory; 