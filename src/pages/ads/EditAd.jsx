import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { FaUpload, FaTimes, FaImage, FaSave, FaArrowLeft, FaTrash } from 'react-icons/fa';
import adService from '../../services/adService';

function EditAd() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAuthenticated, loading } = useAuth();
  
  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Form verisi
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    price: '',
    isNew: true
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
            isNew: ad.isNew !== undefined ? ad.isNew : true
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
          toast.error('İlan bilgileri yüklenemedi');
        }
      } catch (err) {
        console.error('İlan detayları yüklenirken hata:', err);
        setError('İlan detayları yüklenemedi');
        toast.error('İlan bilgileri yüklenemedi');
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
      toast.info('İlan düzenlemek için giriş yapmalısınız');
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
      toast.error('En fazla 10 resim yükleyebilirsiniz');
      return;
    }
    
    // Dosya boyutu ve tipi kontrolü
    const invalidFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return !isValidType || !isValidSize;
    });
    
    if (invalidFiles.length > 0) {
      toast.error('Bazı dosyalar geçersiz formatta veya çok büyük (max 5MB, sadece JPEG, PNG ve WEBP)');
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
  
  // Form gönderimi
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasyon
    if (!formData.description) {
      toast.error('Lütfen ilan açıklaması girin');
      return;
    }
    
    if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0) {
      toast.error('Lütfen geçerli bir fiyat girin');
      return;
    }
    
    // En az bir resim olmalı (var olan veya yeni)
    if (existingImages.length === 0 && newImages.length === 0) {
      toast.error('Lütfen en az bir resim ekleyin');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Form verilerini hazırla
      const formDataToSend = new FormData();
      
      // Temel bilgiler
      formDataToSend.append('Id', formData.id);
      formDataToSend.append('Title', formData.title);
      formDataToSend.append('Description', formData.description);
      formDataToSend.append('Price', formData.price);
      formDataToSend.append('IsNew', formData.isNew);
      
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
        toast.success('İlan başarıyla güncellendi');
        setSuccess(true);
        // İlan detay sayfasına yönlendir
        setTimeout(() => {
          navigate(`/ilanlar/${formData.id}`);
        }, 1500);
      } else {
        setError(response?.message || 'İlan güncellenirken bir hata oluştu');
        toast.error(response?.message || 'İlan güncellenirken bir hata oluştu');
      }
    } catch (err) {
      console.error('İlan güncellenirken hata:', err);
      setError('İlan güncellenirken bir hata oluştu');
      toast.error(err?.message || 'İlan güncellenirken bir hata oluştu');
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
        <h1 className="text-2xl font-bold">İlanı Düzenle</h1>
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
          İlan başarıyla güncellendi. Yönlendiriliyorsunuz...
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1">
          <h2 className="text-xl font-semibold mb-4">İlan Bilgileri</h2>
          
          {/* İlan Başlığı */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              İlan Başlığı <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="İlan başlığı girin"
              required
            />
          </div>
          
          {/* İlan Açıklaması */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              İlan Açıklaması <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="textarea textarea-bordered w-full"
              rows="6"
              placeholder="İlan açıklaması girin"
              required
            ></textarea>
          </div>
          
          {/* Fiyat */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Fiyat (TL) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="Fiyat girin"
              min="0"
              step="0.01"
              required
            />
          </div>
          
          {/* Durum (Yeni/İkinci El) */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Ürün Durumu
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
                <span>İkinci El</span>
              </label>
            </div>
          </div>
        </div>
        
        {/* Resimler */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Resimler</h2>
          
          <div className="mb-2 text-sm text-gray-600">
            En az 1, en fazla 10 resim yükleyebilirsiniz (JPEG, PNG, WEBP / Max 5MB)
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
                <p className="text-gray-600">Resim yüklemek için tıklayın</p>
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
                    title="Resmi Kaldır"
                  >
                    <FaTrash />
                  </button>
                </div>
                
                {image.isExisting && image.isMain && (
                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    Ana Resim
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
                <FaSave /> İlanı Güncelle
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditAd; 