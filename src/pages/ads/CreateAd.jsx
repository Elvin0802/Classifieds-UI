import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { FaUpload, FaTimes, FaImage, FaSave, FaArrowLeft } from 'react-icons/fa';
import adService from '../../services/adService';
import categoryService from '../../services/categoryService';
import locationService from '../../services/locationService';

function CreateAd() {
  const navigate = useNavigate();
  const { isAuthenticated, user, loading } = useAuth();
  
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Form verisi
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    isNew: true,
    categoryId: '',
    mainCategoryId: '',
    locationId: '',
    subCategoryValues: [],
    images: []
  });
  
  // Kategori verileri
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  
  // Lokasyon verileri
  const [locations, setLocations] = useState([]);
  
  // Resim verileri
  const [previewImages, setPreviewImages] = useState([]);
  
  // Kullanıcı girişi kontrolü
  useEffect(() => {
    // Eğer auth context yükleniyor ise, yükleme görüntüsü gösterilecek
    if (loading) {
      console.log('Auth durumu yükleniyor, kontrol erteleniyor...');
      return;
    }
    
    console.log('CreateAd: Auth durumu kontrol ediliyor:', isAuthenticated ? 'giriş yapılmış' : 'giriş yapılmamış');
    
    if (!isAuthenticated) {
      console.log('CreateAd: Kimlik doğrulama gerekiyor, giriş sayfasına yönlendiriliyor');
      
      // Sadece kullanıcı bilgilendirmesi göster
      toast.info('Giriş etməlisiz', {
        autoClose: 1000,
        position: 'top-center'
      });
      
      // Mevcut URL'yi state olarak ilet, böylece giriş yapınca bu sayfaya dönebilir
      const currentPath = window.location.pathname;
      navigate('/login', { 
        state: { from: currentPath },
        replace: true // Geçmişi değiştir (geri butonu ile buraya dönmeyi engelle)
      });
    } else {
      console.log('CreateAd: Kimlik doğrulama başarılı, ilan oluşturma sayfası görüntüleniyor');
    }
  }, [isAuthenticated, navigate, loading]);
  
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
  
  // Ana kategori seçildiğinde
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
        // Kategori detayını getir ve içindeki ana kategorileri kullan
        const response = await categoryService.getCategoryById(formData.categoryId);
        const category = response.data?.item;
        
        if (category && category.mainCategories) {
          setMainCategories(category.mainCategories || []);
        } else {
          setMainCategories([]);
        }
        
        // Ana kategori seçimini sıfırla
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
        // Ana kategori detayını getir ve içindeki alt kategorileri kullan
        const response = await categoryService.getMainCategoryById(formData.mainCategoryId);
        const mainCategory = response.data?.item;
        
        if (mainCategory && mainCategory.subCategories) {
          setSubCategories(mainCategory.subCategories || []);
          
          // Alt kategori değerlerini başlat
          const subCategoryValues = (mainCategory.subCategories || []).map(subCategory => ({
            subCategoryId: subCategory.id,
            value: '',
            type: subCategory.type,
            name: subCategory.name,
            isRequired: subCategory.isRequired,
            options: subCategory.options || []
          }));
          
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
  }, [formData.mainCategoryId]);
  
  // Form değişiklikleri
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
  
  // Resim yükleme işlemi
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Maksimum 5 resim kontrolü
    if (formData.images.length + files.length > 5) {
      toast.error('Max 5 foto yükləyə bilərsiz');
      return;
    }
    
    // Resim ekle
    const newImages = [...formData.images, ...files];
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
    
    // Önizleme oluştur
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...newPreviews]);
  };
  
  // Resim silme işlemi
  const handleRemoveImage = (index) => {
    // Önizleme URL'ini serbest bırak
    URL.revokeObjectURL(previewImages[index]);
    
    // Resmi ve önizlemeyi kaldır
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };
  
  // Form gönderme
  const handleSubmit = async (e) => {
    e.preventDefault();
    setPageLoading(true);
    setError(null);
    
    // Validation
    if (!formData.title.trim()) {
      setError('Elan başlığı məcburidir');
      setPageLoading(false);
      return;
    }
    
    if (!formData.description.trim()) {
      setError('Elan açıqlaması məcburidir');
      setPageLoading(false);
      return;
    }
    
    if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0) {
      setError('Düzgün qiymət daxil edin');
      setPageLoading(false);
      return;
    }
    
    if (!formData.categoryId) {
      setError('Mütləq kategoriya seçin');
      setPageLoading(false);
      return;
    }
    
    if (!formData.mainCategoryId) {
      setError('Mütləq alt kategoriya seçin');
      setPageLoading(false);
      return;
    }
    
    if (!formData.locationId) {
      setError('Mütləq Məkan seçin');
      setPageLoading(false);
      return;
    }
    
    if (formData.images.length === 0) {
      setError('Ən az 1 foto seçin');
      setPageLoading(false);
      return;
    }
    
    // Zorunlu alt kategori değerlerini kontrol et
    const requiredSubCategories = formData.subCategoryValues.filter(item => item.isRequired && !item.value);
    if (requiredSubCategories.length > 0) {
      setError(`"${requiredSubCategories[0].name}" məcburidir`);
      setPageLoading(false);
      return;
    }
    
    try {
      // FormData oluştur (multipart/form-data gönderimi için)
      const formDataToSend = new FormData();
      
      // Temel alanları doğrudan FormData'ya ekle
      formDataToSend.append('Title', formData.title);
      formDataToSend.append('Description', formData.description);
      formDataToSend.append('Price', formData.price);
      formDataToSend.append('IsNew', formData.isNew);
      formDataToSend.append('CategoryId', formData.categoryId);
      formDataToSend.append('MainCategoryId', formData.mainCategoryId);
      formDataToSend.append('LocationId', formData.locationId);
      
      // Alt kategori değerlerini JSON formatında oluştur - API'nin istediği şekilde büyük harfle başlayan property isimleri
      const filteredSubCategoryValues = formData.subCategoryValues
        .filter(item => item.value)
        .map(item => ({
          SubCategoryId: item.subCategoryId,
          Value: item.value
        }));
      
      // JSON formatına çevir ve SubCategoryValuesJson olarak ekle (SubCategoryValues yerine)
      const subCategoryValuesJson = JSON.stringify(filteredSubCategoryValues);
      formDataToSend.append('SubCategoryValuesJson', subCategoryValuesJson);
      
      // Resimleri ekle
      formData.images.forEach(image => {
        formDataToSend.append('Images', image);
      });
      
      console.log('FormData içeriği:');
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0], typeof pair[1], 
          pair[0] === 'SubCategoryValuesJson' ? JSON.parse(pair[1]) : 
          typeof pair[1] === 'string' ? pair[1] : '[Dosya]');
      }
      
      // İlanı oluştur
      try {
        const response = await adService.createWithImages(formDataToSend);
        
        if (response.status === 201 || response.status === 200 || response.isSucceeded) {
          setSuccess(true);
          toast.success('Elan Yaradıldı');
          
          // İlan detay sayfasına yönlendir
          setTimeout(() => {
            if (response.data?.id) {
              navigate(`/ads/${response.data.id}`);
            } else {
              navigate('/ads');
            }
          }, 1500);
        } else {
          throw new Error('Elan yaradilmadi: ' + (response?.message || 'xəta'));
        }
      } catch (apiError) {
        console.error('İlan oluşturma API hatası:', apiError);
        setError(`İlan yaradilmadi: ${apiError.message}`);
      }
    } catch (error) {
      console.error('İlan oluşturulurken hata:', error);
      setError('İlan yaradilmadi');
    } finally {
      setPageLoading(false);
    }
  };
  
  // Alt kategori input alanını render et
  const renderSubCategoryInput = (subCategory) => {
    const { subCategoryId, type, name, value, options = [] } = subCategory;
    
    // Number input
    if (type === 0) {
      return (
        <input
          type="number"
          value={value || ''}
          onChange={(e) => handleSubCategoryValueChange(subCategoryId, e.target.value)}
          className="input input-bordered w-full"
          placeholder={`${name} değerini girin`}
        />
      );
    }
    
    // Select input
    if (type === 1) {
      return (
        <select
          value={value || ''}
          onChange={(e) => handleSubCategoryValueChange(subCategoryId, e.target.value)}
          className="select select-bordered w-full"
        >
          <option value="" disabled>Seçin</option>
          {options.map((option, idx) => (
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
        value={value || ''}
        onChange={(e) => handleSubCategoryValueChange(subCategoryId, e.target.value)}
        className="input input-bordered w-full"
        placeholder={`${name} daxil edin`}
      />
    );
  };
  
  // Loading durumunda bekletme ekranı göster
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-600">Doğrulama yoxlanılır...</p>
      </div>
    );
  }

  // Giriş yapılmamışsa, sayfa içeriğini gösterme
  // Not: useEffect tarafından zaten login sayfasına yönlendirilecek
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-xl font-semibold text-gray-700 mb-4">Əngəlləndiniz</p>
        <p className="text-gray-600 mb-6">Elan yaratmaq üçün daxil olmalısınız.</p>
        <button
          onClick={() => navigate('/login', { state: { from: window.location.pathname } })}
          className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition"
        >
          Giriş Yap
        </button>
      </div>
    );
  }
  
  // Başarılı ise
  if (success) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="card bg-base-100 shadow-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-success mb-4">Elan Yaradildi!</h2>
          <p className="mb-4">Elan Əlavə Olundu</p>
          <div className="flex justify-center">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
          <p className="mt-4 text-sm text-gray-500">Siz təfərrüatlar səhifəsinə yönləndirilirsiniz....</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Yeni Elan Yarat</h1>
        <button 
          onClick={() => navigate(-1)}
          className="btn btn-outline btn-sm"
        >
          <FaArrowLeft className="mr-2" /> Geri
        </button>
      </div>
      
      {error && (
        <div className="alert alert-error mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-lg border-b pb-2 mb-4">Elan Məlumatları</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Başlık */}
            <div className="form-control col-span-full">
              <label className="label">
                <span className="label-text font-medium">Elan Başlığı<span className="text-red-500">*</span></span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input input-bordered w-full"
                placeholder="Elan Başlığı"
                required
              />
            </div>
            
            {/* Açıklama */}
            <div className="form-control col-span-full">
              <label className="label">
                <span className="label-text font-medium">Açıqlama<span className="text-red-500">*</span></span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="textarea textarea-bordered h-24"
                placeholder="Elan açıqlamasını yazın"
                required
              ></textarea>
            </div>
            
            {/* Fiyat ve Durumu */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Qiymət (AZN)<span className="text-red-500">*</span></span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="input input-bordered w-full"
                placeholder="Qiymət"
                min="0"
                step="0.01"
                required
              />
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Məhsulun Vəziyyəti</span>
              </label>
              <div className="flex items-center space-x-4 mt-2">
                <label className="cursor-pointer label justify-start gap-2">
                  <input
                    type="checkbox"
                    name="isNew"
                    checked={formData.isNew}
                    onChange={handleChange}
                    className="checkbox checkbox-primary"
                  />
                  <span className="label-text">Yeni</span>
                </label>
              </div>
            </div>
          </div>
          
          <h2 className="card-title text-lg border-b pb-2 mt-6 mb-4">Kategoriya Məlumatlları</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      {renderSubCategoryInput(subCategory)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <h2 className="card-title text-lg border-b pb-2 mt-6 mb-4">Məkan Məlumatlları</h2>
          
          <div className="grid grid-cols-1 gap-4">
            {/* Lokasyon */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Məkan<span className="text-red-500">*</span></span>
              </label>
              <select
                name="locationId"
                value={formData.locationId}
                onChange={handleChange}
                className="select select-bordered w-full"
                required
              >
                <option value="" disabled>Məkan Seçin</option>
                {locations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.city}, {location.country}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <h2 className="card-title text-lg border-b pb-2 mt-6 mb-4">Fotolar</h2>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Elan Fotoları<span className="text-red-500">*</span></span>
              <span className="label-text-alt">{formData.images.length}/5</span>
            </label>
            
            {/* Resim Önizlemeleri */}
            {previewImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 my-2">
                {previewImages.map((src, index) => (
                  <div key={index} className="relative rounded overflow-hidden border border-gray-200 h-24">
                    <img 
                      src={src} 
                      alt={`Elan Fotosu ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <FaTimes />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-primary text-white text-xs py-0.5 text-center">
                        Əsas Foto
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Resim Yükleme */}
            {formData.images.length < 5 && (
              <div className="mt-2">
                <label className="btn btn-outline btn-block">
                  <FaUpload className="mr-2" /> Foto əlavə et
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  max 5 foto ola bilər
                </p>
              </div>
            )}
          </div>
          
          <div className="card-actions justify-end mt-6">
            <button 
              type="button" 
              className="btn btn-ghost"
              onClick={() => navigate(-1)}
              disabled={pageLoading}
            >
              Ləğv et
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={pageLoading}
            >
              {pageLoading ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Elan yaradılır...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" /> Elanı Paylaş
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CreateAd; 