import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaTrash, FaEye, FaFilter, FaSearch, FaList, FaFolder } from 'react-icons/fa';
import { toast } from 'react-toastify';
import categoryService from '../../../services/categoryService';

function AdminCategories() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'main', 'sub'
  const [searchTerm, setSearchTerm] = useState('');
  
  // Kategorileri yükle
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryService.getAllCategories();
      setCategories(response.data.items || []);
    } catch (error) {
      console.error('Kategoriler alınırken hata:', error);
      toast.error('Kategoriler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };
  
  // Ana kategorileri yükle
  const fetchMainCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryService.getAllMainCategories();
      setMainCategories(response.data.items || []);
    } catch (error) {
      console.error('Ana kategoriler alınırken hata:', error);
      toast.error('Ana kategoriler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };
  
  // Alt kategorileri yükle
  const fetchSubCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryService.getAllSubCategories();
      setSubCategories(response.data.items || []);
    } catch (error) {
      console.error('Alt kategoriler alınırken hata:', error);
      toast.error('Alt kategoriler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };
  
  // Aktif taba göre kategorileri yükle
  useEffect(() => {
    if (activeTab === 'all') {
      fetchCategories();
    } else if (activeTab === 'main') {
      fetchMainCategories();
    } else if (activeTab === 'sub') {
      fetchSubCategories();
    }
  }, [activeTab]);
  
  // Kategori silme işlemi (not: Backend'de bu özellik mevcutsa)
  const handleDeleteCategory = async (categoryId, categoryType) => {
    if (window.confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
      // Backend'de silme işlemi API endpoint'i varsa burada kullanılacak
      toast.info('Silme işlemi şu anda desteklenmiyor.');
    }
  };
  
  // Filtreli kategorileri getir
  const getFilteredCategories = () => {
    let dataToFilter = [];
    
    if (activeTab === 'all') {
      dataToFilter = categories;
    } else if (activeTab === 'main') {
      dataToFilter = mainCategories;
    } else if (activeTab === 'sub') {
      dataToFilter = subCategories;
    }
    
    if (!searchTerm.trim()) {
      return dataToFilter;
    }
    
    const searchLower = searchTerm.toLowerCase();
    return dataToFilter.filter(category => 
      category.name.toLowerCase().includes(searchLower) || 
      (category.description && category.description.toLowerCase().includes(searchLower))
    );
  };
  
  const filteredCategories = getFilteredCategories();
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Kategori Yönetimi</h1>
        
        <div className="flex flex-col md:flex-row gap-2">
          <Link to="/admin/categories/create" className="btn btn-primary btn-sm">
            <FaPlus className="mr-2" /> Yeni Kategori
          </Link>
          <Link to="/admin/categories/create-main" className="btn btn-secondary btn-sm">
            <FaPlus className="mr-2" /> Yeni Ana Kategori
          </Link>
          <Link to="/admin/categories/create-sub" className="btn btn-accent btn-sm">
            <FaPlus className="mr-2" /> Yeni Alt Kategori
          </Link>
        </div>
      </div>
      
      {/* Filtre ve Arama */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="flex items-center">
            <FaFilter className="text-gray-500 mr-2" />
            <div className="tabs tabs-boxed">
              <button 
                className={`tab ${activeTab === 'all' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                Tüm Kategoriler
              </button>
              <button 
                className={`tab ${activeTab === 'main' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('main')}
              >
                Ana Kategoriler
              </button>
              <button 
                className={`tab ${activeTab === 'sub' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('sub')}
              >
                Alt Kategoriler
              </button>
            </div>
          </div>
          
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Kategori ara..."
              className="input input-bordered w-full pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
          </div>
        </div>
      </div>
      
      {/* Kategori Tablosu */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {filteredCategories.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <p className="text-gray-600">Kategori bulunamadı. Yeni bir kategori ekleyin.</p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-lg shadow-md">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th className="w-16"></th>
                    <th>Kategori Adı</th>
                    <th>Tür</th>
                    <th>Açıklama</th>
                    <th className="w-24">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((category) => (
                    <tr key={category.id}>
                      <td>
                        {category.type === 'main' ? (
                          <FaFolder className="text-orange-500" size={20} />
                        ) : category.type === 'sub' ? (
                          <FaList className="text-blue-500" size={20} />
                        ) : (
                          <FaList className="text-gray-500" size={20} />
                        )}
                      </td>
                      <td className="font-medium">{category.name}</td>
                      <td>
                        {category.type === 'main' ? 'Ana Kategori' : 
                         category.type === 'sub' ? 'Alt Kategori' : 'Kategori'}
                      </td>
                      <td className="max-w-xs truncate">{category.description || '-'}</td>
                      <td>
                        <div className="flex space-x-2">
                          <Link 
                            to={`/admin/categories/${category.id}`} 
                            className="btn btn-ghost btn-xs"
                          >
                            <FaEye className="text-blue-500" />
                          </Link>
                          <button 
                            onClick={() => handleDeleteCategory(category.id, category.type)}
                            className="btn btn-ghost btn-xs"
                          >
                            <FaTrash className="text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminCategories; 