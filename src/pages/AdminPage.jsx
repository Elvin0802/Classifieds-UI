import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { categoryService, locationService } from '../services';
import { Loading } from '../components/ui';
import { FaPlus, FaTrash, FaEdit, FaChevronRight, FaChevronDown, FaExclamationTriangle } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('categories');
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Category state
  const [newCategory, setNewCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  
  // Main Category state
  const [newMainCategory, setNewMainCategory] = useState('');
  const [selectedMainCategory, setSelectedMainCategory] = useState(null);
  
  // Sub Category state
  const [newSubCategory, setNewSubCategory] = useState({
    name: '',
    type: 'input',
    options: '',
    isRequired: false
  });
  
  // Location state
  const [newLocation, setNewLocation] = useState({
    city: '',
    country: 'Türkiye' // Varsayılan olarak Türkiye
  });

  useEffect(() => {
    // Admin sayfası için auth kontrolü kaldırıldı
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch categories
      const categoriesResponse = await categoryService.getAllCategories();
      console.log('Categories response:', categoriesResponse);
      setCategories(categoriesResponse.items || []);
      
      // Fetch locations
      const locationsResponse = await locationService.getAllLocations();
      console.log('Locations response:', locationsResponse);
      setLocations(locationsResponse.items || []); // items array'ini kullan
    } catch (err) {
      setError('Veriler yüklenirken bir hata oluştu.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Category functions
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    
    if (!newCategory.trim()) {
      toast.error('Kategori adı boş olamaz.');
      return;
    }
    
    try {
      setLoading(true);
      await categoryService.createCategory({ name: newCategory });
      toast.success('Kategori başarıyla oluşturuldu.');
      setNewCategory('');
      fetchData();
    } catch (err) {
      toast.error('Kategori oluşturulurken bir hata oluştu.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategoryExpand = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
    
    if (!expandedCategories[categoryId]) {
      setSelectedCategory(categoryId);
      fetchMainCategories(categoryId);
    }
  };

  const fetchMainCategories = async (categoryId) => {
    try {
      // getAllMainCategories yerine getCategoryById kullanarak ana kategorileri alıyoruz
      const response = await categoryService.getCategoryById(categoryId);
      console.log('Category detail response:', response);
      
      // API yanıtının yapısını kontrol et
      let mainCategories = [];
      
      if (response && response.categoryDto && response.categoryDto.mainCategories) {
        // Yanıt formatı 1
        mainCategories = response.categoryDto.mainCategories;
      } else if (response && response.mainCategories) {
        // Yanıt formatı 2
        mainCategories = response.mainCategories;
      } else if (response && response.item && response.item.mainCategories) {
        // Yanıt formatı 3
        mainCategories = response.item.mainCategories;
      }
      
      // Update the categories array with main categories
      setCategories(prev => 
        prev.map(cat => 
          cat.id === categoryId 
            ? { ...cat, mainCategories: mainCategories || [] } 
            : cat
        )
      );
    } catch (err) {
      console.error('Alt kategoriler yüklenirken bir hata oluştu:', err);
      toast.error('Alt kategoriler yüklenirken bir hata oluştu: ' + (err.response?.data?.message || err.message));
    }
  };

  // Main Category functions
  const handleCreateMainCategory = async (e) => {
    e.preventDefault();
    
    if (!selectedCategory) {
      toast.error('Lütfen bir kategori seçin.');
      return;
    }
    
    if (!newMainCategory.trim()) {
      toast.error('Alt kategori adı boş olamaz.');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Alt kategori oluşturma isteği:', { 
        name: newMainCategory,
        categoryId: selectedCategory
      });
      
      const response = await categoryService.createMainCategory({ 
        name: newMainCategory,
        categoryId: selectedCategory
      });
      
      console.log('Alt kategori oluşturma yanıtı:', response);
      toast.success('Alt kategori başarıyla oluşturuldu.');
      setNewMainCategory('');
      fetchMainCategories(selectedCategory);
    } catch (err) {
      toast.error('Alt kategori oluşturulurken bir hata oluştu: ' + (err.response?.data?.message || err.message));
      console.error('Alt kategori oluşturma hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMainCategorySelect = async (mainCategoryId) => {
    setSelectedMainCategory(mainCategoryId);
    
    try {
      // Ana kategori detaylarını getir
      const response = await categoryService.getMainCategoryById(mainCategoryId);
      console.log('Ana kategori seçildi:', mainCategoryId);
      console.log('API yanıtı:', response);
      
      // API yanıtının yapısını kontrol et
      let subCategories = [];
      
      if (response && response.mainCategoryDto && response.mainCategoryDto.subCategories) {
        // Yanıt formatı 1
        subCategories = response.mainCategoryDto.subCategories;
      } else if (response && response.subCategories) {
        // Yanıt formatı 2
        subCategories = response.subCategories;
      } else if (response && response.item && response.item.subCategories) {
        // Yanıt formatı 3
        subCategories = response.item.subCategories;
      }
      
      // Update the categories array with sub categories
      setCategories(prev => 
        prev.map(cat => {
          if (cat.id === selectedCategory) {
            return {
              ...cat,
              mainCategories: cat.mainCategories.map(mainCat => 
                mainCat.id === mainCategoryId
                  ? { ...mainCat, subCategories: subCategories }
                  : mainCat
              )
            };
          }
          return cat;
        })
      );
    } catch (err) {
      console.error('Alt özellikler yüklenirken bir hata oluştu:', err);
      toast.error('Alt özellikler yüklenirken bir hata oluştu.');
    }
  };

  // Sub Category functions
  const handleCreateSubCategory = async (e) => {
    e.preventDefault();
    
    if (!selectedMainCategory) {
      toast.error('Lütfen bir alt kategori seçin.');
      return;
    }
    
    if (!newSubCategory.name.trim()) {
      toast.error('Alt özellik adı boş olamaz.');
      return;
    }
    
    if (newSubCategory.type === 'select' && !newSubCategory.options.trim()) {
      toast.error('Seçenek listesi boş olamaz.');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Alt özellik oluşturma isteği:', {
        name: newSubCategory.name,
        type: newSubCategory.type,
        options: newSubCategory.options,
        isRequired: newSubCategory.isRequired,
        mainCategoryId: selectedMainCategory
      });
      
      const response = await categoryService.createSubCategory({
        name: newSubCategory.name,
        type: newSubCategory.type,
        options: newSubCategory.options,
        isRequired: newSubCategory.isRequired,
        mainCategoryId: selectedMainCategory
      });
      
      console.log('Alt özellik oluşturma yanıtı:', response);
      toast.success('Alt özellik başarıyla oluşturuldu.');
      setNewSubCategory({
        name: '',
        type: 'input',
        options: '',
        isRequired: false
      });
      handleMainCategorySelect(selectedMainCategory);
    } catch (err) {
      toast.error('Alt özellik oluşturulurken bir hata oluştu: ' + (err.response?.data?.message || err.message));
      console.error('Alt özellik oluşturma hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  // Location functions
  const handleCreateLocation = async (e) => {
    e.preventDefault();
    
    if (!newLocation.city.trim()) {
      toast.error('Şehir adı boş olamaz.');
      return;
    }
    
    try {
      setLoading(true);
      // API dokümanına göre city ve country parametreleri gönderilmeli
      await locationService.createLocation({ 
        city: newLocation.city,
        country: newLocation.country
      });
      toast.success('Konum başarıyla oluşturuldu.');
      setNewLocation({
        city: '',
        country: 'Türkiye'
      });
      fetchData();
    } catch (err) {
      toast.error('Konum oluşturulurken bir hata oluştu.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLocation = async (locationId) => {
    if (!window.confirm('Bu konumu silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      setLoading(true);
      await locationService.deleteLocation({ id: locationId });
      toast.success('Konum başarıyla silindi.');
      fetchData();
    } catch (err) {
      toast.error('Konum silinirken bir hata oluştu.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !categories.length && !locations.length) {
    return <Loading fullScreen />;
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
      
      {/* Admin Navigation */}
      <div className="flex mb-6 border-b">
        <Link 
          to="/admin" 
          className={`mr-4 pb-2 px-2 ${!window.location.pathname.includes('/reports') ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
        >
          Kategoriler & Lokasyonlar
        </Link>
        <Link 
          to="/admin/reports" 
          className={`mr-4 pb-2 px-2 flex items-center ${window.location.pathname.includes('/reports') ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
        >
          <FaExclamationTriangle className="mr-1" /> Raporlar
        </Link>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex mb-6">
        <button
          className={`mr-4 px-4 py-2 rounded-md ${activeTab === 'categories' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          onClick={() => setActiveTab('categories')}
        >
          Kategoriler
        </button>
        <button
          className={`px-4 py-2 rounded-md ${activeTab === 'locations' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          onClick={() => setActiveTab('locations')}
        >
          Yerler
        </button>
      </div>
      
      {loading && <Loading />}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {/* Tabs Content */}
      {!loading && !error && (
        <>
          {activeTab === 'categories' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Categories Section */}
              <div className="bg-white p-4 rounded-md shadow-md">
                {/* Rest of the categories section */}
                <h2 className="text-lg font-semibold mb-4">Kategoriler</h2>
                
                {/* New Category Form */}
                <form onSubmit={handleCreateCategory} className="mb-4">
                  <div className="flex">
                    <input
                      type="text"
                      className="flex-grow px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Yeni kategori adı"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-3 py-2 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <FaPlus />
                    </button>
                  </div>
                </form>
                
                {/* Categories List */}
                <ul className="space-y-2">
                  {categories.map((category) => (
                    <li key={category.id} className="border rounded-md p-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <button
                            onClick={() => toggleCategoryExpand(category.id)}
                            className="mr-2 focus:outline-none"
                          >
                            {expandedCategories[category.id] ? (
                              <FaChevronDown className="text-gray-600" />
                            ) : (
                              <FaChevronRight className="text-gray-600" />
                            )}
                          </button>
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-500 hover:text-red-700 focus:outline-none"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                      
                      {/* Expanded Main Categories */}
                      {expandedCategories[category.id] && (
                        <div className="mt-2 ml-6">
                          <h3 className="text-sm font-medium mb-2">Alt Kategoriler</h3>
                          
                          {/* Main Categories List */}
                          <ul className="space-y-1 mb-2">
                            {category.mainCategories && category.mainCategories.map((mainCategory) => (
                              <li 
                                key={mainCategory.id} 
                                className={`p-2 rounded-md cursor-pointer ${selectedMainCategory === mainCategory.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                                onClick={() => handleMainCategorySelect(mainCategory.id)}
                              >
                                {mainCategory.name}
                              </li>
                            ))}
                            {(!category.mainCategories || category.mainCategories.length === 0) && (
                              <li className="text-sm text-gray-500 italic">Alt kategori bulunmuyor</li>
                            )}
                          </ul>
                          
                          {/* New Main Category Form */}
                          <form onSubmit={handleCreateMainCategory} className="flex mt-2">
                            <input
                              type="text"
                              className="flex-grow px-3 py-1 text-sm border rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Yeni alt kategori ekle"
                              value={newMainCategory}
                              onChange={(e) => setNewMainCategory(e.target.value)}
                            />
                            <button
                              type="submit"
                              className="bg-blue-600 text-white px-2 py-1 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <FaPlus />
                            </button>
                          </form>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Main Category Detail */}
              <div className="bg-white p-4 rounded-md shadow-md">
                <h2 className="text-lg font-semibold mb-4">Alt Kategori Detayları</h2>
                
                {!selectedMainCategory ? (
                  <p className="text-gray-500">Detaylarını görmek için bir alt kategori seçin</p>
                ) : (
                  <>
                    <div className="mb-4">
                      <h3 className="text-md font-medium mb-2">
                        {categories
                          .find(cat => cat.mainCategories?.some(main => main.id === selectedMainCategory))
                          ?.mainCategories?.find(main => main.id === selectedMainCategory)?.name || 'Seçilen Alt Kategori'}
                      </h3>
                      
                      {/* Sub Categories List */}
                      <div className="space-y-2 mt-4">
                        <h4 className="text-sm font-medium">Alt Özellikler</h4>
                        
                        {/* Check if subCategories exist and have items */}
                        {(() => {
                          const category = categories.find(cat => 
                            cat.mainCategories?.some(main => main.id === selectedMainCategory)
                          );
                          
                          if (!category) return <p className="text-sm text-gray-500 italic">Kategori bulunamadı</p>;
                          
                          const mainCategory = category.mainCategories?.find(main => 
                            main.id === selectedMainCategory
                          );
                          
                          if (!mainCategory) return <p className="text-sm text-gray-500 italic">Alt kategori bulunamadı</p>;
                          
                          if (!mainCategory.subCategories || mainCategory.subCategories.length === 0) {
                            return <p className="text-sm text-gray-500 italic">Alt özellik bulunmuyor</p>;
                          }
                          
                          return (
                            <ul className="divide-y">
                              {mainCategory.subCategories.map(subCategory => (
                                <li key={subCategory.id} className="py-2">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <span className="font-medium">{subCategory.name}</span>
                                      <div className="text-xs text-gray-500 mt-1">
                                        <p>Tip: {subCategory.type === 'input' ? 'Metin Kutusu' : subCategory.type === 'select' ? 'Seçim Kutusu' : subCategory.type}</p>
                                        <p>Zorunlu: {subCategory.isRequired ? 'Evet' : 'Hayır'}</p>
                                        {subCategory.type === 'select' && (
                                          <p>Seçenekler: {subCategory.options}</p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => handleDeleteSubCategory(subCategory.id)}
                                        className="text-red-500 hover:text-red-700 focus:outline-none"
                                      >
                                        <FaTrash />
                                      </button>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          );
                        })()}
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              {/* Sub Category Form */}
              <div className="bg-white p-4 rounded-md shadow-md">
                <h2 className="text-lg font-semibold mb-4">Yeni Alt Özellik Ekle</h2>
                
                {!selectedMainCategory ? (
                  <p className="text-gray-500">Alt özellik eklemek için önce bir alt kategori seçin</p>
                ) : (
                  <form onSubmit={handleCreateSubCategory}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Özellik Adı
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Özellik adı"
                          value={newSubCategory.name}
                          onChange={(e) => setNewSubCategory({...newSubCategory, name: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tip
                        </label>
                        <select
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={newSubCategory.type}
                          onChange={(e) => setNewSubCategory({...newSubCategory, type: e.target.value})}
                          required
                        >
                          <option value="input">Metin Kutusu</option>
                          <option value="select">Seçim Kutusu</option>
                        </select>
                      </div>
                      
                      {newSubCategory.type === 'select' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Seçenekler (virgülle ayır)
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Örn: Seçenek 1,Seçenek 2,Seçenek 3"
                            value={newSubCategory.options}
                            onChange={(e) => setNewSubCategory({...newSubCategory, options: e.target.value})}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Seçenekleri virgülle ayırarak girin. Her seçenek bir opsiyon olacaktır.
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isRequired"
                          className="mr-2"
                          checked={newSubCategory.isRequired}
                          onChange={(e) => setNewSubCategory({...newSubCategory, isRequired: e.target.checked})}
                        />
                        <label htmlFor="isRequired" className="text-sm text-gray-700">
                          Bu alan zorunlu mu?
                        </label>
                      </div>
                      
                      <button
                        type="submit"
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Alt Özellik Ekle
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'locations' && (
            <div className="bg-white p-4 rounded-md shadow-md">
              <h2 className="text-lg font-semibold mb-4">Yerler</h2>
              
              {/* New Location Form */}
              <form onSubmit={handleCreateLocation} className="mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Şehir
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Şehir adı"
                      value={newLocation.city}
                      onChange={(e) => setNewLocation({...newLocation, city: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ülke
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ülke adı"
                      value={newLocation.country}
                      onChange={(e) => setNewLocation({...newLocation, country: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Yeni Yer Ekle
                </button>
              </form>
              
              {/* Locations List */}
              <h3 className="font-medium mb-2">Mevcut Yerler</h3>
              
              {locations.length === 0 ? (
                <p className="text-gray-500 italic">Henüz yer bulunmuyor</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Şehir
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ülke
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          İşlemler
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {locations.map((location) => (
                        <tr key={location.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {location.city}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {location.country}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleDeleteLocation(location.id)}
                              className="text-red-500 hover:text-red-700 focus:outline-none"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminPage; 