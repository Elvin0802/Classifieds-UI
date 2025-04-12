import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { adService, categoryService, locationService } from '../services';
import { Loading } from '../components/ui';

const CreateAdPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch categories
        const categoriesResponse = await categoryService.getAllCategories();
        console.log('Kategoriler:', categoriesResponse);
        if (categoriesResponse && (categoriesResponse.categories || categoriesResponse.items)) {
          setCategories(categoriesResponse.categories || categoriesResponse.items || []);
        } else {
          console.error('Kategori yanıtı beklenmeyen formatta:', categoriesResponse);
          setError('Kategoriler yüklenirken bir sorun oluştu.');
        }
        
        // Fetch locations
        const locationsResponse = await locationService.getAllLocations();
        console.log('Lokasyonlar:', locationsResponse);
        if (locationsResponse && (locationsResponse.locations || locationsResponse.items)) {
          setLocations(locationsResponse.locations || locationsResponse.items || []);
        } else {
          console.error('Lokasyon yanıtı beklenmeyen formatta:', locationsResponse);
          setError('Lokasyonlar yüklenirken bir sorun oluştu.');
        }
      } catch (err) {
        console.error('Veriler yüklenirken hata:', err);
        setError('Veriler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      price: '',
      isNew: true,
      categoryId: '',
      mainCategoryId: '',
      locationId: '',
      subCategoryValues: {}
    },
    validationSchema: Yup.object({
      title: Yup.string()
        .required('Başlık gereklidir')
        .min(5, 'Başlık en az 5 karakter olmalıdır')
        .max(100, 'Başlık en fazla 100 karakter olmalıdır'),
      description: Yup.string()
        .required('Açıklama gereklidir')
        .min(20, 'Açıklama en az 20 karakter olmalıdır'),
      price: Yup.number()
        .required('Fiyat gereklidir')
        .positive('Fiyat pozitif olmalıdır'),
      categoryId: Yup.string()
        .required('Kategori seçimi gereklidir'),
      mainCategoryId: Yup.string()
        .required('Alt kategori seçimi gereklidir'),
      locationId: Yup.string()
        .required('Konum seçimi gereklidir')
    }),
    onSubmit: async (values) => {
      try {
        setSubmitting(true);
        
        // Prepare sub category values
        const subCategoryValues = [];
        for (const [subCategoryId, value] of Object.entries(values.subCategoryValues)) {
          if (value) {
            subCategoryValues.push({
              subCategoryId,
              value
            });
          }
        }
        
        const adData = {
          title: values.title,
          description: values.description,
          price: parseFloat(values.price),
          isNew: values.isNew,
          categoryId: values.categoryId,
          mainCategoryId: values.mainCategoryId,
          locationId: values.locationId,
          appUserId: "00000000-0000-0000-0000-000000000000", // Sabit appUserId değeri
          subCategoryValues: subCategoryValues // Dizi olarak gönder
        };
        
        console.log('İlan oluşturma verileri:', adData);
        const response = await adService.createAd(adData);
        
        toast.success('İlan başarıyla oluşturuldu!');
        navigate('/'); // Başarılı durumda ana sayfaya yönlendir
      } catch (err) {
        console.error('İlan oluşturma hatası:', err);
        
        // 401 hatası durumunda login sayfasına yönlendir
        if (err.response && err.response.status === 401) {
          toast.error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
          navigate('/login');
          return;
        }
        
        toast.error('İlan oluşturulurken bir hata oluştu.');
      } finally {
        setSubmitting(false);
      }
    }
  });

  // Fetch main categories when category changes
  useEffect(() => {
    const fetchMainCategories = async () => {
      if (!formik.values.categoryId) {
        setMainCategories([]);
        setSubCategories([]);
        return;
      }
      
      try {
        console.log('Ana kategoriler getiriliyor, kategori ID:', formik.values.categoryId);
        setError(null);
        
        const response = await categoryService.getAllMainCategories(formik.values.categoryId);
        console.log('Ana kategoriler yanıtı:', response);
        
        if (response && response.mainCategories && Array.isArray(response.mainCategories)) {
          setMainCategories(response.mainCategories);
        } else {
          console.error('Ana kategori yanıtı beklenmeyen formatta:', response);
          setError('Ana kategoriler yüklenirken bir sorun oluştu.');
          setMainCategories([]);
        }
        
        // Reset main category and sub category values
        formik.setFieldValue('mainCategoryId', '');
        formik.setFieldValue('subCategoryValues', {});
        setSubCategories([]);
      } catch (err) {
        console.error('Ana kategoriler yüklenirken bir hata oluştu:', err);
        toast.error('Ana kategoriler yüklenirken bir hata oluştu.');
        setMainCategories([]);
      }
    };
    
    fetchMainCategories();
  }, [formik.values.categoryId]);

  // Fetch sub categories when main category changes
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!formik.values.mainCategoryId) {
        setSubCategories([]);
        return;
      }
      
      try {
        console.log('Alt kategoriler getiriliyor, ana kategori ID:', formik.values.mainCategoryId);
        setError(null);
        
        const response = await categoryService.getMainCategoryById(formik.values.mainCategoryId);
        console.log('Ana kategori detayları yanıtı:', response);
        
        let subCategoriesData = [];
        
        if (response && response.mainCategoryDto && response.mainCategoryDto.subCategories) {
          subCategoriesData = response.mainCategoryDto.subCategories;
        } else if (response && response.subCategories) {
          subCategoriesData = response.subCategories;
        } else {
          console.error('Alt kategori yanıtı beklenmeyen formatta:', response);
          setError('Alt kategoriler yüklenirken bir sorun oluştu.');
          setSubCategories([]);
          return;
        }
        
        console.log('İşlenmiş alt kategoriler:', subCategoriesData);
        setSubCategories(subCategoriesData || []);
        
        // Initialize sub category values
        const initialSubCategoryValues = {};
        subCategoriesData.forEach(subCat => {
          initialSubCategoryValues[subCat.id] = '';
        });
        
        formik.setFieldValue('subCategoryValues', initialSubCategoryValues);
      } catch (err) {
        console.error('Alt özellikler yüklenirken bir hata oluştu:', err);
        if (err.response) {
          console.error('Hata detayları:', err.response.data);
          console.error('Hata durumu:', err.response.status);
        }
        toast.error('Alt özellikler yüklenirken bir hata oluştu.');
        setSubCategories([]);
      }
    };
    
    fetchSubCategories();
  }, [formik.values.mainCategoryId]);

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">Yeni İlan Oluştur</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
            İlan Başlığı*
          </label>
          <input
            id="title"
            name="title"
            type="text"
            className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
              formik.touched.title && formik.errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="İlanınız için kısa ve açıklayıcı bir başlık yazın"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.title}
            maxLength={100}
          />
          {formik.touched.title && formik.errors.title && (
            <p className="mt-1 text-sm text-red-500">{formik.errors.title}</p>
          )}
        </div>
        
        {/* Category Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category */}
          <div>
            <label htmlFor="categoryId" className="block text-gray-700 font-medium mb-2">
              Kategori*
            </label>
            <select
              id="categoryId"
              name="categoryId"
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary appearance-none ${
                formik.touched.categoryId && formik.errors.categoryId ? 'border-red-500' : 'border-gray-300'
              }`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.categoryId}
            >
              <option value="">Kategori Seçin</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {formik.touched.categoryId && formik.errors.categoryId && (
              <p className="mt-1 text-sm text-red-500">{formik.errors.categoryId}</p>
            )}
          </div>
          
          {/* Main Category */}
          <div>
            <label htmlFor="mainCategoryId" className="block text-gray-700 font-medium mb-2">
              Alt Kategori*
            </label>
            <select
              id="mainCategoryId"
              name="mainCategoryId"
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary appearance-none ${
                formik.touched.mainCategoryId && formik.errors.mainCategoryId ? 'border-red-500' : 'border-gray-300'
              }`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.mainCategoryId}
              disabled={mainCategories.length === 0}
            >
              <option value="">Alt Kategori Seçin</option>
              {mainCategories.map(mainCategory => (
                <option key={mainCategory.id} value={mainCategory.id}>
                  {mainCategory.name}
                </option>
              ))}
            </select>
            {formik.touched.mainCategoryId && formik.errors.mainCategoryId && (
              <p className="mt-1 text-sm text-red-500">{formik.errors.mainCategoryId}</p>
            )}
          </div>
        </div>
        
        {/* Location */}
        <div>
          <label htmlFor="locationId" className="block text-gray-700 font-medium mb-2">
            Konum*
          </label>
          <select
            id="locationId"
            name="locationId"
            className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary appearance-none ${
              formik.touched.locationId && formik.errors.locationId ? 'border-red-500' : 'border-gray-300'
            }`}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.locationId}
          >
            <option value="">Konum Seçin</option>
            {locations.map(location => (
              <option key={location.id} value={location.id}>
                {location.city}
              </option>
            ))}
          </select>
          {formik.touched.locationId && formik.errors.locationId && (
            <p className="mt-1 text-sm text-red-500">{formik.errors.locationId}</p>
          )}
        </div>
        
        {/* Price and Condition */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Price */}
          <div>
            <label htmlFor="price" className="block text-gray-700 font-medium mb-2">
              Fiyat (₺)*
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                formik.touched.price && formik.errors.price ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Fiyat"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.price}
            />
            {formik.touched.price && formik.errors.price && (
              <p className="mt-1 text-sm text-red-500">{formik.errors.price}</p>
            )}
          </div>
          
          {/* Condition */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Durum</label>
            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="isNew"
                  checked={formik.values.isNew === true}
                  onChange={() => formik.setFieldValue('isNew', true)}
                  className="form-radio text-primary h-5 w-5"
                />
                <span className="ml-2">Sıfır / Yeni</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="isNew"
                  checked={formik.values.isNew === false}
                  onChange={() => formik.setFieldValue('isNew', false)}
                  className="form-radio text-primary h-5 w-5"
                />
                <span className="ml-2">İkinci El</span>
              </label>
            </div>
          </div>
        </div>
        
        {/* Sub Categories/Features */}
        {subCategories.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
            <h3 className="font-medium text-gray-700 mb-4">Özellikler</h3>
            <div className="space-y-4">
              {subCategories.map(subCategory => (
                <div key={subCategory.id}>
                  <label 
                    htmlFor={`subCategoryValues.${subCategory.id}`} 
                    className="block text-gray-700 mb-2"
                  >
                    {subCategory.name}
                    {subCategory.isRequired && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  
                  {(subCategory.type === 1 || subCategory.type === 'select') ? (
                    <select
                      id={`subCategoryValues.${subCategory.id}`}
                      name={`subCategoryValues.${subCategory.id}`}
                      value={formik.values.subCategoryValues[subCategory.id] || ''}
                      onChange={formik.handleChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                    >
                      <option value="">Seçiniz</option>
                      {subCategory.options && Array.isArray(subCategory.options) && 
                        subCategory.options.map((option, index) => (
                          <option key={option.id || index} value={option.value || option}>
                            {option.value || option}
                          </option>
                        ))
                      }
                    </select>
                  ) : (
                    <input
                      id={`subCategoryValues.${subCategory.id}`}
                      name={`subCategoryValues.${subCategory.id}`}
                      type="text"
                      placeholder={`${subCategory.name} girin`}
                      value={formik.values.subCategoryValues[subCategory.id] || ''}
                      onChange={formik.handleChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
            Açıklama*
          </label>
          <textarea
            id="description"
            name="description"
            rows="6"
            placeholder="İlanınız hakkında detaylı bilgi verin"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`input ${formik.touched.description && formik.errors.description ? 'border-danger focus:ring-danger' : ''}`}
          ></textarea>
          {formik.touched.description && formik.errors.description && (
            <div className="text-danger text-sm mt-1">{formik.errors.description}</div>
          )}
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary w-full"
          >
            {submitting ? <Loading size="small" /> : 'İlanı Yayınla'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAdPage; 