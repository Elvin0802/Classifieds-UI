import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { FaUpload, FaTimes, FaImage, FaSave, FaArrowLeft, FaTrash } from 'react-icons/fa';
import adService from '../../services/adService';
import categoryService from '../../services/categoryService';
import locationService from '../../services/locationService';

function EditAd() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAuthenticated, loading } = useAuth();
  
  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Kategori ve lokasyon state'leri
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  
  // Form verisi
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    price: '',
    isNew: true,
    categoryId: '',
    mainCategoryId: '',
    locationId: '',
    subCategoryValues: []
  });
  
  // Resim verileri
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  
  // İlan verilerini getir
  useEffect(() => {
    const fetchAdDetails = async () => {
      if (!id) return;
      
      setPageLoading(true);
      setError(null);
      
      try {
        const response = await adService.getById(id);
        
        if (response && response.isSucceeded && response.data && response.data.item) {
          const ad = response.data.item;
          
          // Form verilerini ayarla
          setFormData({
            id: ad.id,
            title: ad.title || '',
            description: ad.description || '',
            price: ad.price ? ad.price.toString() : '',
            isNew: ad.isNew !== undefined ? ad.isNew : true,
            categoryId: ad.category?.id || '',
            mainCategoryId: ad.mainCategory?.id || '',
            locationId: ad.location?.id || '',
            subCategoryValues: (ad.adSubCategoryValues || []).map(val => ({
              subCategoryId: val.subCategoryId,
              value: val.value,
              // type, name, isRequired, options sonradan fetchSubCategories ile doldurulacak
            }))
          });
          
          // Mevcut resimleri ayarla
          if (ad.images && ad.images.length > 0) {
            setExistingImages(ad.images.map(img => ({
              id: img.id,
              url: img.url,
              isMain: img.isMain
            })));
          }
        } else {
          setError('İlan detayları alınamadı');
          toast.error('yüklənmədi');
        }
      } catch (err) {
        console.error('İlan detayları yüklenirken hata:', err);
        setError('yüklənmədi');
        toast.error('yüklənmədi');
      } finally {
        setPageLoading(false);
      }
    };
    
    fetchAdDetails();
  }, [id]);
  
  // Kullanıcı girişi kontrolü
  useEffect(() => {
    if (loading) return;
    
    if (!isAuthenticated) {
      toast.info('giriş etməlisiz');
      const currentPath = window.location.pathname;
      navigate('/login', { 
        state: { from: currentPath },
        replace: true
      });
    }
  }, [isAuthenticated, navigate, loading]);
  
  // Mevcut resimleri preview'a ekle
  useEffect(() => {
    // Önce var olan resimleri preview'a ekle
    const existingPreviews = existingImages.map(img => ({
      id: img.id,
      url: img.url,
      isExisting: true
    }));
    
    // Sonra yeni resimleri ekle
    const newPreviews = newImages.map((file, index) => ({
      url: URL.createObjectURL(file),
      isExisting: false,
      index
    }));
    
    setPreviewImages([...existingPreviews, ...newPreviews]);
    
    // Cleanup function
    return () => {
      newPreviews.forEach(preview => URL.revokeObjectURL(preview.url));
    };
  }, [existingImages, newImages]);
  
  // Kategorileri getir
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getAllCategories();
        setCategories(response.data?.items || []);
      } catch (error) {
        console.error('Kategoriler alınırken hata:', error);
        toast.error('Kategoriyalar yüklənmədi');
      }
    };
    fetchCategories();
  }, []);

  // Lokasyonları getir
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await locationService.getAll();
        setLocations(response.data?.items || []);
      } catch (error) {
        console.error('Lokasyon bilgileri alınırken hata:', error);
        toast.error('Məkanlar yüklənmədi');
      }
    };
    fetchLocations();
  }, []);

  // Ana kategori seçildiğinde ana kategorileri getir
  useEffect(() => {
    const fetchMainCategories = async () => {
      if (!formData.categoryId) {
        setMainCategories([]);
        setFormData(prev => ({
          ...prev,
          mainCategoryId: '',
          subCategoryValues: []
        }));
        return;
      }
      try {
        const response = await categoryService.getCategoryById(formData.categoryId);
        const category = response.data?.item;
        if (category && category.mainCategories) {
          setMainCategories(category.mainCategories || []);
        } else {
          setMainCategories([]);
        }
        setFormData(prev => ({
          ...prev,
          mainCategoryId: '',
          subCategoryValues: []
        }));
      } catch (error) {
        console.error('Ana kategoriler alınırken hata:', error);
        toast.error('Əsas Kategoriyalar yüklənmədi');
      }
    };
    fetchMainCategories();
  }, [formData.categoryId]);

  // Alt kategorileri getir
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!formData.mainCategoryId) {
        setSubCategories([]);
        setFormData(prev => ({
          ...prev,
          subCategoryValues: []
        }));
        return;
      }
      try {
        const response = await categoryService.getMainCategoryById(formData.mainCategoryId);
        const mainCategory = response.data?.item;
        if (mainCategory && mainCategory.subCategories) {
          setSubCategories(mainCategory.subCategories || []);
          const subCategoryValues = (mainCategory.subCategories || []).map(subCategory => {
            // Eğer mevcut ilanda değer varsa onu ata
            const existing = formData.subCategoryValues.find(x => x.subCategoryId === subCategory.id);
            return {
              subCategoryId: subCategory.id,
              value: existing ? existing.value : '',
              type: subCategory.type,
              name: subCategory.name,
              isRequired: subCategory.isRequired,
              options: subCategory.options || []
            };
          });
          setFormData(prev => ({
            ...prev,
            subCategoryValues
          }));
        } else {
          setSubCategories([]);
          setFormData(prev => ({
            ...prev,
            subCategoryValues: []
          }));
        }
      } catch (error) {
        console.error('Alt kategoriler alınırken hata:', error);
        toast.error('Alt kategoriyalar yüklənmədi');
      }
    };
    fetchSubCategories();
    // eslint-disable-next-line
  }, [formData.mainCategoryId]);
  
  // Form değişiklikleri
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Yeni resim ekleme
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // Toplam resim sayısı kontrolü
    if (existingImages.length + newImages.length + files.length > 10) {
      toast.error('max 5 foto ola bilər');
      return;
    }
    
    // Dosya boyutu ve tipi kontrolü
    const invalidFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return !isValidType || !isValidSize;
    });
    
    if (invalidFiles.length > 0) {
      toast.error('foto yarasızdır');
      return;
    }
    
    setNewImages(prev => [...prev, ...files]);
    
    // Input değerini sıfırla
    e.target.value = '';
  };
  
  // Var olan resmi silme
  const handleRemoveExistingImage = (imageId) => {
    // Silinecek resimler listesine ekle
    setImagesToDelete(prev => [...prev, imageId]);
    
    // Var olan resimler listesinden çıkar
    setExistingImages(prev => prev.filter(img => img.id !== imageId));
  };
  
  // Yeni yüklenen resmi silme
  const handleRemoveNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };
  
  // Herhangi bir resmi silme
  const handleRemoveImage = (isExisting, idOrIndex) => {
    if (isExisting) {
      handleRemoveExistingImage(idOrIndex);
    } else {
      handleRemoveNewImage(idOrIndex);
    }
  };
  
  // Alt kategori değeri değiştiğinde
  const handleSubCategoryValueChange = (subCategoryId, value) => {
    setFormData(prev => ({
      ...prev,
      subCategoryValues: prev.subCategoryValues.map(item =>
        item.subCategoryId === subCategoryId ? { ...item, value } : item
      )
    }));
  };
  
  // Form gönderimi
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasyon
    if (!formData.title.trim()) {
      toast.error('Elan başlığı məcburidir');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('açıqlama yazın');
      return;
    }
    if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0) {
      toast.error('qiymət daxil edin');
      return;
    }
    if (!formData.categoryId) {
      toast.error('Mütləq kategoriya seçin');
      return;
    }
    if (!formData.mainCategoryId) {
      toast.error('Mütləq alt kategoriya seçin');
      return;
    }
    if (!formData.locationId) {
      toast.error('Mütləq Məkan seçin');
      return;
    }
    if (existingImages.length === 0 && newImages.length === 0) {
      toast.error('foto əlavə edin');
      return;
    }
    // Zorunlu alt kategori değerlerini kontrol et
    const requiredSubCategories = formData.subCategoryValues.filter(item => item.isRequired && !item.value);
    if (requiredSubCategories.length > 0) {
      toast.error(`"${requiredSubCategories[0].name}" məcburidir`);
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Form verilerini hazırla
      const formDataToSend = new FormData();
      formDataToSend.append('Id', formData.id);
      formDataToSend.append('Title', formData.title);
      formDataToSend.append('Description', formData.description);
      formDataToSend.append('Price', formData.price);
      formDataToSend.append('IsNew', formData.isNew);
      formDataToSend.append('CategoryId', formData.categoryId);
      formDataToSend.append('MainCategoryId', formData.mainCategoryId);
      formDataToSend.append('LocationId', formData.locationId);
      // Alt kategori değerlerini JSON formatında ekle
      const filteredSubCategoryValues = formData.subCategoryValues
        .filter(item => item.value)
        .map(item => ({
          SubCategoryId: item.subCategoryId,
          Value: item.value
        }));
      const subCategoryValuesJson = JSON.stringify(filteredSubCategoryValues);
      formDataToSend.append('SubCategoryValuesJson', subCategoryValuesJson);
      // Mevcut resimler için
      existingImages.forEach(img => {
        formDataToSend.append('ExistingImages', img.id);
      });
      // Silinecek resimler için
      imagesToDelete.forEach(imgId => {
        formDataToSend.append('ImagesToDelete', imgId);
      });
      // Yeni resimler için
      newImages.forEach(file => {
        formDataToSend.append('NewImages', file);
      });
      // API isteği gönder
      const response = await adService.updateWithImages(formDataToSend);
      if (response && response.isSucceeded) {
        toast.success('elan güncəlləndi');
        setSuccess(true);
        setTimeout(() => {
          navigate(`/ilanlar/${formData.id}`);
        }, 1500);
      } else {
        setError(response?.message || 'xəta , elan güncəllənmədi');
        toast.error(response?.message || 'xəta , elan güncəllənmədi');
      }
    } catch (err) {
      console.error('İlan güncellenirken hata:', err);
      setError('xəta , elan güncəllənmədi');
      toast.error(err?.message || 'xəta , elan güncəllənmədi');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (pageLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Elanı Güncəllə</h1>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-outline btn-sm flex items-center gap-1"
        >
          <FaArrowLeft /> Geri
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Elan uğurla yeniləndi. Siz yönləndirilirsiniz...
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1">
          <h2 className="text-xl font-semibold mb-4">Elan Məlumatları</h2>
          
          {/* İlan Başlığı */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Elan Başlığı <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="Elan Başlığı yazın"
              required
            />
          </div>
          
          {/* İlan Açıklaması */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Elan Açıqlaması <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="textarea textarea-bordered w-full"
              rows="6"
              placeholder="Elan açıqlaması yazın"
              required
            ></textarea>
          </div>
          
          {/* Fiyat */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Qiymət (AZN) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="Qiymət daxil edin"
              min="0"
              step="0.01"
              required
            />
          </div>
          
          {/* Durum (Yeni/İkinci El) */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Məhsulun vəziyyəti
            </label>
            <div className="flex gap-4">
              <label className="cursor-pointer flex items-center gap-2">
                <input
                  type="radio"
                  name="isNew"
                  checked={formData.isNew === true}
                  onChange={() => setFormData({...formData, isNew: true})}
                  className="radio radio-primary"
                />
                <span>Yeni</span>
              </label>
              <label className="cursor-pointer flex items-center gap-2">
                <input
                  type="radio"
                  name="isNew"
                  checked={formData.isNew === false}
                  onChange={() => setFormData({...formData, isNew: false})}
                  className="radio radio-primary"
                />
                <span>İşlənmiş</span>
              </label>
            </div>
          </div>
          
          {/* Kategori ve Ana Kategori */}
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Kategori */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Kategoriya<span className="text-red-500">*</span></span>
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="select select-bordered w-full"
                required
              >
                <option value="" disabled>Kategoriya Seçin</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            {/* Ana Kategori */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Əsas Kategoriya<span className="text-red-500">*</span></span>
              </label>
              <select
                name="mainCategoryId"
                value={formData.mainCategoryId}
                onChange={handleChange}
                className="select select-bordered w-full"
                disabled={!formData.categoryId || mainCategories.length === 0}
                required
              >
                <option value="" disabled>Əsas Kategoriya Seçin</option>
                {mainCategories.map(mainCategory => (
                  <option key={mainCategory.id} value={mainCategory.id}>{mainCategory.name}</option>
                ))}
              </select>
              {formData.categoryId && mainCategories.length === 0 && (
                <label className="label">
                  <span className="label-text-alt text-warning">Əsas kategoriya yoxdur</span>
                </label>
              )}
            </div>
          </div>
          
          {/* Alt Kategori Değerleri */}
          {formData.subCategoryValues.length > 0 && (
            <div className="col-span-full mt-2">
              <h3 className="font-medium mb-2">Alt Kategoriya Xüsusiyyətləri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.subCategoryValues.map(subCategory => (
                  <div className="form-control" key={subCategory.subCategoryId}>
                    <label className="label">
                      <span className="label-text">
                        {subCategory.name}
                        {subCategory.isRequired && <span className="text-red-500">*</span>}
                      </span>
                    </label>
                    {(() => {
                      // Number input
                      if (subCategory.type === 0) {
                        return (
                          <input
                            type="number"
                            value={subCategory.value || ''}
                            onChange={e => handleSubCategoryValueChange(subCategory.subCategoryId, e.target.value)}
                            className="input input-bordered w-full"
                            placeholder={`${subCategory.name} değerini girin`}
                          />
                        );
                      }
                      // Select input
                      if (subCategory.type === 1) {
                        return (
                          <select
                            value={subCategory.value || ''}
                            onChange={e => handleSubCategoryValueChange(subCategory.subCategoryId, e.target.value)}
                            className="select select-bordered w-full"
                          >
                            <option value="" disabled>Seçin</option>
                            {subCategory.options.map((option, idx) => (
                              <option key={idx} value={typeof option === 'object' ? option.value : option}>
                                {typeof option === 'object' ? option.value : option}
                              </option>
                            ))}
                          </select>
                        );
                      }
                      // Text input (default)
                      return (
                        <input
                          type="text"
                          value={subCategory.value || ''}
                          onChange={e => handleSubCategoryValueChange(subCategory.subCategoryId, e.target.value)}
                          className="input input-bordered w-full"
                          placeholder={`${subCategory.name} daxil edin`}
                        />
                      );
                    })()}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Resimler */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Fotolar</h2>
          
          <div className="mb-2 text-sm text-gray-600">
            min 1 ç max 5 foto əlavə edə bilərsiz.
          </div>
          
          {/* Resim Yükleme Alanı */}
          <div className="mb-4">
            <label
              className="block w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:bg-gray-50"
            >
              <input
                type="file"
                className="hidden"
                accept="image/jpeg, image/png, image/webp"
                multiple
                onChange={handleImageUpload}
              />
              <div className="flex flex-col items-center justify-center">
                <FaUpload className="text-3xl text-gray-400 mb-2" />
                <p className="text-gray-600">Foto yükləyin</p>
              </div>
            </label>
          </div>
          
          {/* Resim Önizlemeleri */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
            {previewImages.map((image, index) => (
              <div
                key={image.isExisting ? image.id : `new-${index}`}
                className="relative group bg-gray-100 rounded-lg overflow-hidden"
                style={{ height: '180px' }}
              >
                <img
                  src={image.url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(image.isExisting, image.isExisting ? image.id : image.index)}
                    className="text-white p-2 rounded-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Fotonu sil"
                  >
                    <FaTrash />
                  </button>
                </div>
                
                {image.isExisting && image.isMain && (
                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    Əsas Foto
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Gönder Düğmesi */}
        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            className={`btn btn-primary flex items-center gap-2 ${submitting ? 'loading' : ''}`}
            disabled={submitting}
          >
            {submitting ? (
              'Güncelleniyor...'
            ) : (
              <>
                <FaSave /> Elanı Güncəllə
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditAd; 