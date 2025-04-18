import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import adService from '../../services/adService';
import categoryService from '../../services/categoryService';
import locationService from '../../services/locationService';
import { FaUpload, FaTimes, FaImage, FaSave } from 'react-icons/fa';

function CreateAd() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Kategori yönetimi
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  
  // Konum yönetimi
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  
  // Resim yönetimi
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Seçili değerleri izle
  const selectedCategoryId = watch('categoryId');
  const selectedMainCategoryId = watch('mainCategoryId');
  const selectedProvinceId = watch('provinceId');
  const selectedDistrictId = watch('districtId');
  
  // Kullanıcı girişi kontrolü
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/giris', { state: { from: '/ilan-ver' } });
    }
  }, [isAuthenticated, navigate]);
  
  // Kategorileri getir
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories();
        if (response) {
          setCategories(response);
        }
      } catch (err) {
        console.error('Kategoriler yüklenirken hata oluştu:', err);
        setError('Kategoriler yüklenemedi, lütfen daha sonra tekrar deneyin.');
      }
    };
    
    fetchCategories();
  }, []);
  
  // İlleri getir
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await locationService.getProvinces();
        if (response) {
          setProvinces(response);
        }
      } catch (err) {
        console.error('İller yüklenirken hata oluştu:', err);
        setError('Konum bilgileri yüklenemedi, lütfen daha sonra tekrar deneyin.');
      }
    };
    
    fetchProvinces();
  }, []);
  
  // Kategori seçildiğinde ana kategorileri getir
  useEffect(() => {
    const fetchMainCategories = async () => {
      if (!selectedCategoryId) {
        setMainCategories([]);
        setValue('mainCategoryId', '');
        setValue('subCategoryId', '');
        return;
      }
      
      try {
        const response = await categoryService.getSubcategories(selectedCategoryId);
        if (response) {
          setMainCategories(response);
          setValue('mainCategoryId', '');
          setValue('subCategoryId', '');
        }
      } catch (err) {
        console.error('Ana kategoriler yüklenirken hata oluştu:', err);
      }
    };
    
    fetchMainCategories();
  }, [selectedCategoryId, setValue]);
  
  // Ana kategori seçildiğinde alt kategorileri getir
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!selectedMainCategoryId) {
        setSubCategories([]);
        setValue('subCategoryId', '');
        return;
      }
      
      try {
        const response = await categoryService.getSubcategories(selectedMainCategoryId);
        if (response) {
          setSubCategories(response);
          setValue('subCategoryId', '');
        }
      } catch (err) {
        console.error('Alt kategoriler yüklenirken hata oluştu:', err);
      }
    };
    
    fetchSubCategories();
  }, [selectedMainCategoryId, setValue]);
  
  // İl seçildiğinde ilçeleri getir
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!selectedProvinceId) {
        setDistricts([]);
        setValue('districtId', '');
        setValue('neighborhoodId', '');
        return;
      }
      
      try {
        const response = await locationService.getDistricts(selectedProvinceId);
        if (response) {
          setDistricts(response);
          setValue('districtId', '');
          setValue('neighborhoodId', '');
        }
      } catch (err) {
        console.error('İlçeler yüklenirken hata oluştu:', err);
      }
    };
    
    fetchDistricts();
  }, [selectedProvinceId, setValue]);
  
  // İlçe seçildiğinde mahalleleri getir
  useEffect(() => {
    const fetchNeighborhoods = async () => {
      if (!selectedDistrictId) {
        setNeighborhoods([]);
        setValue('neighborhoodId', '');
        return;
      }
      
      try {
        const response = await locationService.getNeighborhoods(selectedDistrictId);
        if (response) {
          setNeighborhoods(response);
          setValue('neighborhoodId', '');
        }
      } catch (err) {
        console.error('Mahalleler yüklenirken hata oluştu:', err);
      }
    };
    
    fetchNeighborhoods();
  }, [selectedDistrictId, setValue]);
  
  // Resim yükleme işlemleri
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Maksimum 5 resim kontrolü
    if (images.length + files.length > 5) {
      setError('En fazla 5 resim yükleyebilirsiniz.');
      return;
    }
    
    // Dosya boyutu ve tip kontrolü
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        setError('Sadece JPG, PNG ve WebP formatında resimler kabul edilmektedir.');
        return false;
      }
      
      if (file.size > maxSize) {
        setError('Resim boyutu 5MB\'dan küçük olmalıdır.');
        return false;
      }
      
      return true;
    });
    
    if (validFiles.length === 0) return;
    
    // Yeni resimleri ekle
    setImages(prev => [...prev, ...validFiles]);
    
    // Önizleme URL'lerini oluştur
    const newPreviews = validFiles.map(file => {
      return {
        file,
        url: URL.createObjectURL(file)
      };
    });
    
    setPreviewImages(prev => [...prev, ...newPreviews]);
    setError(null);
  };
  
  // Resim silme
  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    
    // Önizleme URL'sini serbest bırak
    URL.revokeObjectURL(previewImages[index].url);
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };
  
  // Form gönderme
  const onSubmit = async (data) => {
    if (images.length === 0) {
      setError('En az bir resim eklemelisiniz.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Metin alanlarını içeren ilan verisini oluştur
      const adData = {
        title: data.title,
        description: data.description,
        price: parseFloat(data.price),
        categoryId: data.subCategoryId || data.mainCategoryId || data.categoryId, // En alt seviyedeki kategoriyi kullan
        condition: data.condition,
        location: {
          provinceId: data.provinceId,
          districtId: data.districtId,
          neighborhoodId: data.neighborhoodId
        },
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail || user.email,
        isNegotiable: data.isNegotiable === 'true',
        isDraft: false
      };
      
      // İlanı oluştur
      const createdAd = await adService.createAd(adData);
      
      if (createdAd && createdAd.id) {
        // Resimleri yükle
        setUploadingImage(true);
        
        for (let i = 0; i < images.length; i++) {
          await adService.uploadAdImage(createdAd.id, images[i]);
        }
        
        setSuccess(true);
        setError(null);
        
        // 3 saniye sonra ilan detay sayfasına yönlendir
        setTimeout(() => {
          navigate(`/ilanlar/${createdAd.id}`);
        }, 3000);
      }
    } catch (err) {
      console.error('İlan oluşturulurken hata oluştu:', err);
      setError('İlan oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsLoading(false);
      setUploadingImage(false);
    }
  };
  
  if (success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card bg-base-100 shadow-md max-w-2xl mx-auto">
          <div className="card-body text-center">
            <h1 className="card-title text-2xl mb-4 mx-auto">İlanınız Başarıyla Oluşturuldu!</h1>
            <p className="mb-4">Tebrikler! İlanınız başarıyla yayınlandı. İlan detay sayfasına yönlendiriliyorsunuz...</p>
            <span className="loading loading-spinner loading-md mx-auto"></span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Yeni İlan Oluştur</h1>
      
      {error && (
        <div className="alert alert-error mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="card bg-base-100 shadow-md">
        <div className="card-body">
          {/* İlan Bilgileri */}
          <h2 className="text-xl font-semibold mb-4">İlan Bilgileri</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* İlan Başlığı */}
            <div className="form-control md:col-span-2">
              <label className="label">
                <span className="label-text">İlan Başlığı<span className="text-error">*</span></span>
              </label>
              <input
                type="text"
                className={`input input-bordered w-full ${errors.title ? 'input-error' : ''}`}
                placeholder="İlanınız için kısa ve açıklayıcı bir başlık girin"
                {...register('title', { 
                  required: 'Başlık zorunludur', 
                  minLength: { value: 10, message: 'Başlık en az 10 karakter olmalıdır' },
                  maxLength: { value: 100, message: 'Başlık en fazla 100 karakter olabilir' }
                })}
              />
              {errors.title && <span className="text-error text-sm mt-1">{errors.title.message}</span>}
            </div>
            
            {/* Kategori Seçimi */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Kategori<span className="text-error">*</span></span>
              </label>
              <select
                className={`select select-bordered ${errors.categoryId ? 'select-error' : ''}`}
                {...register('categoryId', { required: 'Kategori seçimi zorunludur' })}
              >
                <option value="">Kategori Seçin</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              {errors.categoryId && <span className="text-error text-sm mt-1">{errors.categoryId.message}</span>}
            </div>
            
            {/* Ana Kategori */}
            {mainCategories.length > 0 && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Ana Kategori<span className="text-error">*</span></span>
                </label>
                <select
                  className={`select select-bordered ${errors.mainCategoryId ? 'select-error' : ''}`}
                  {...register('mainCategoryId', { required: 'Ana kategori seçimi zorunludur' })}
                >
                  <option value="">Ana Kategori Seçin</option>
                  {mainCategories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                {errors.mainCategoryId && <span className="text-error text-sm mt-1">{errors.mainCategoryId.message}</span>}
              </div>
            )}
            
            {/* Alt Kategori */}
            {subCategories.length > 0 && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Alt Kategori<span className="text-error">*</span></span>
                </label>
                <select
                  className={`select select-bordered ${errors.subCategoryId ? 'select-error' : ''}`}
                  {...register('subCategoryId', { required: 'Alt kategori seçimi zorunludur' })}
                >
                  <option value="">Alt Kategori Seçin</option>
                  {subCategories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                {errors.subCategoryId && <span className="text-error text-sm mt-1">{errors.subCategoryId.message}</span>}
              </div>
            )}
            
            {/* Fiyat */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Fiyat (TL)<span className="text-error">*</span></span>
              </label>
              <input
                type="number"
                className={`input input-bordered w-full ${errors.price ? 'input-error' : ''}`}
                placeholder="Fiyat"
                min="0"
                step="0.01"
                {...register('price', { 
                  required: 'Fiyat zorunludur', 
                  min: { value: 0, message: 'Fiyat 0\'dan küçük olamaz' },
                  validate: value => !isNaN(parseFloat(value)) || 'Geçerli bir sayı girin'
                })}
              />
              {errors.price && <span className="text-error text-sm mt-1">{errors.price.message}</span>}
            </div>
            
            {/* Pazarlık */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Pazarlık</span>
              </label>
              <select
                className="select select-bordered"
                {...register('isNegotiable')}
              >
                <option value="false">Pazarlık Yok</option>
                <option value="true">Pazarlık Var</option>
              </select>
            </div>
            
            {/* Ürün Durumu */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Ürün Durumu<span className="text-error">*</span></span>
              </label>
              <select
                className={`select select-bordered ${errors.condition ? 'select-error' : ''}`}
                {...register('condition', { required: 'Ürün durumu seçimi zorunludur' })}
              >
                <option value="">Durum Seçin</option>
                <option value="new">Yeni</option>
                <option value="likenew">Yeni Gibi</option>
                <option value="good">İyi</option>
                <option value="fair">Orta</option>
                <option value="poor">Kötü</option>
              </select>
              {errors.condition && <span className="text-error text-sm mt-1">{errors.condition.message}</span>}
            </div>
            
            {/* Açıklama */}
            <div className="form-control md:col-span-2">
              <label className="label">
                <span className="label-text">Açıklama<span className="text-error">*</span></span>
              </label>
              <textarea
                className={`textarea textarea-bordered h-32 ${errors.description ? 'textarea-error' : ''}`}
                placeholder="İlanınızla ilgili detaylı bilgi verin"
                {...register('description', { 
                  required: 'Açıklama zorunludur', 
                  minLength: { value: 30, message: 'Açıklama en az 30 karakter olmalıdır' },
                  maxLength: { value: 2000, message: 'Açıklama en fazla 2000 karakter olabilir' }
                })}
              ></textarea>
              {errors.description && <span className="text-error text-sm mt-1">{errors.description.message}</span>}
              <div className="text-xs text-gray-500 mt-1 text-right">
                <span>{watch('description')?.length || 0}/2000</span>
              </div>
            </div>
          </div>
          
          {/* Konum Bilgileri */}
          <h2 className="text-xl font-semibold mb-4 mt-8">Konum Bilgileri</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* İl */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">İl<span className="text-error">*</span></span>
              </label>
              <select
                className={`select select-bordered ${errors.provinceId ? 'select-error' : ''}`}
                {...register('provinceId', { required: 'İl seçimi zorunludur' })}
              >
                <option value="">İl Seçin</option>
                {provinces.map(province => (
                  <option key={province.id} value={province.id}>{province.name}</option>
                ))}
              </select>
              {errors.provinceId && <span className="text-error text-sm mt-1">{errors.provinceId.message}</span>}
            </div>
            
            {/* İlçe */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">İlçe<span className="text-error">*</span></span>
              </label>
              <select
                className={`select select-bordered ${errors.districtId ? 'select-error' : ''}`}
                disabled={!selectedProvinceId}
                {...register('districtId', { required: 'İlçe seçimi zorunludur' })}
              >
                <option value="">İlçe Seçin</option>
                {districts.map(district => (
                  <option key={district.id} value={district.id}>{district.name}</option>
                ))}
              </select>
              {errors.districtId && <span className="text-error text-sm mt-1">{errors.districtId.message}</span>}
            </div>
            
            {/* Mahalle */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Mahalle</span>
              </label>
              <select
                className="select select-bordered"
                disabled={!selectedDistrictId}
                {...register('neighborhoodId')}
              >
                <option value="">Mahalle Seçin (Opsiyonel)</option>
                {neighborhoods.map(neighborhood => (
                  <option key={neighborhood.id} value={neighborhood.id}>{neighborhood.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* İletişim Bilgileri */}
          <h2 className="text-xl font-semibold mb-4 mt-8">İletişim Bilgileri</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Telefon */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Telefon Numarası<span className="text-error">*</span></span>
              </label>
              <input
                type="tel"
                className={`input input-bordered w-full ${errors.contactPhone ? 'input-error' : ''}`}
                placeholder="05XX XXX XX XX"
                {...register('contactPhone', { 
                  required: 'Telefon numarası zorunludur'
                })}
              />
              {errors.contactPhone && <span className="text-error text-sm mt-1">{errors.contactPhone.message}</span>}
            </div>
            
            {/* E-posta */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">E-posta Adresi</span>
              </label>
              <input
                type="email"
                className={`input input-bordered w-full ${errors.contactEmail ? 'input-error' : ''}`}
                placeholder={user?.email || 'E-posta adresiniz'}
                {...register('contactEmail', { 
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Geçerli bir e-posta adresi girin' }
                })}
              />
              {errors.contactEmail && <span className="text-error text-sm mt-1">{errors.contactEmail.message}</span>}
            </div>
          </div>
          
          {/* Resim Yükleme */}
          <h2 className="text-xl font-semibold mb-4 mt-8">Resimler<span className="text-error">*</span></h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">En fazla 5 resim yükleyebilirsiniz. Desteklenen formatlar: JPG, PNG, WebP. Maksimum boyut: 5MB.</p>
              <span className="text-sm font-medium">{images.length}/5</span>
            </div>
            
            {/* Resim Önizleme */}
            {previewImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-4">
                {previewImages.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview.url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      className="absolute top-2 right-2 bg-error hover:bg-red-700 text-white rounded-full p-1"
                      onClick={() => removeImage(index)}
                    >
                      <FaTimes size={14} />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-primary text-white text-center text-xs py-1">
                        Ana Resim
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Resim Yükleme Butonu */}
            {images.length < 5 && (
              <div className="flex items-center justify-center">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FaUpload className="mb-3 text-gray-400" size={24} />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Resim yüklemek için tıklayın</span>
                    </p>
                    <p className="text-xs text-gray-500">Desteklenen formatlar: JPG, PNG, WebP</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            )}
          </div>
          
          {/* Form Gönderme */}
          <div className="mt-8 flex flex-col sm:flex-row justify-end gap-4">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate('/ilanlar')}
              disabled={isLoading || uploadingImage}
            >
              İptal
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || uploadingImage}
            >
              {isLoading || uploadingImage ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  {uploadingImage ? 'Resimler Yükleniyor...' : 'İlan Oluşturuluyor...'}
                </>
              ) : (
                <>
                  <FaSave className="mr-2" /> İlanı Yayınla
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