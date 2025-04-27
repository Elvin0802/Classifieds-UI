import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSave, FaArrowLeft, FaPlus, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import categoryService from '../../../services/categoryService';

function CreateSubCategory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mainCategories, setMainCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    isRequired: true,
    type: 0, // Varsayılan: Number
    mainCategoryId: '',
    options: []
  });

  const [newOption, setNewOption] = useState('');
  const [showOptions, setShowOptions] = useState(false);

  // Ana kategorileri getir
  useEffect(() => {
    const fetchMainCategories = async () => {
      try {
        const response = await categoryService.getAllMainCategories();
        setMainCategories(response.data.items || []);
      } catch (error) {
        console.error('Ana kategoriler alınırken hata:', error);
        toast.error('Ana kategoriler yüklenirken bir hata oluştu.');
      }
    };
    
    fetchMainCategories();
  }, []);

  // Type değiştiğinde Select ise options göster
  useEffect(() => {
    setShowOptions(parseInt(formData.type) === 1); // Select type: 1
  }, [formData.type]);

  // Form verilerini güncelle
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prevData => ({
      ...prevData,
      [name]: newValue
    }));
  };

  // Yeni seçenek ekle
  const handleAddOption = () => {
    if (!newOption.trim()) {
      toast.warning('Boş seçenek ekleyemezsiniz.');
      return;
    }

    setFormData(prevData => ({
      ...prevData,
      options: [...prevData.options, newOption.trim()]
    }));
    setNewOption('');
  };

  // Seçenek sil
  const handleRemoveOption = (index) => {
    setFormData(prevData => ({
      ...prevData,
      options: prevData.options.filter((_, i) => i !== index)
    }));
  };

  // Alt kategori oluştur
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Select tipi seçilmişse ve seçenek yoksa hata ver
    if (parseInt(formData.type) === 1 && formData.options.length === 0) {
      toast.error('Seçim tipi için en az bir seçenek eklemelisiniz.');
      return;
    }
    
    setLoading(true);
    
    try {
      // API için doğru format oluştur
      const apiData = {
        ...formData,
        type: parseInt(formData.type) // string'den number'a çevir
      };

      // Eğer type Select değilse, options boş dizi olsun
      if (apiData.type !== 1) {
        apiData.options = [];
      }

      await categoryService.createSubCategory(apiData);
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
              >
                <option value="" disabled>Ana kategori seçin</option>
                {mainCategories.map(mainCategory => (
                  <option key={mainCategory.id} value={mainCategory.id}>
                    {mainCategory.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Tip Seçimi */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Veri Tipi*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="select select-bordered"
                required
              >
                <option value="0">Sayı (Number)</option>
                <option value="1">Seçim (Select)</option>
                <option value="2">Metin (Text)</option>
              </select>
              <label className="label">
                <span className="label-text-alt text-gray-500">
                  Alt kategori için kullanılacak veri tipini seçin
                </span>
              </label>
            </div>
            
            {/* Zorunlu Mu? */}
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-4">
                <input
                  type="checkbox"
                  name="isRequired"
                  checked={formData.isRequired}
                  onChange={handleChange}
                  className="checkbox checkbox-primary"
                />
                <span className="label-text font-medium">Zorunlu</span>
              </label>
              <label className="label mt-2">
                <span className="label-text-alt text-gray-500">
                  Bu alt kategori ilan oluşturulurken zorunlu mu olsun?
                </span>
              </label>
            </div>
            
            {/* Eğer Select tipiyse seçenekler */}
            {showOptions && (
              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text font-medium">Seçenekler*</span>
                </label>
                
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    className="input input-bordered flex-1"
                    placeholder="Yeni seçenek girin"
                  />
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="btn btn-primary"
                  >
                    <FaPlus /> Ekle
                  </button>
                </div>
                
                {formData.options.length === 0 ? (
                  <div className="alert alert-warning">
                    Henüz seçenek eklenmedi. Seçim tipi için en az bir seçenek eklemelisiniz.
                  </div>
                ) : (
                  <div className="mt-2">
                    <p className="text-sm mb-2">Eklenen Seçenekler:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {formData.options.map((option, index) => (
                        <div key={index} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                          <span>{option}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(index)}
                            className="btn btn-error btn-sm btn-square"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
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