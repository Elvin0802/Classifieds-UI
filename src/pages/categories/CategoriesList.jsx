import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTags, FaTag, FaChevronDown, FaChevronUp, FaChevronRight } from 'react-icons/fa';
import categoryService from '../../services/categoryService';

const CategoriesList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await categoryService.getAllCategories();
        if (response && response.data && response.data.items) {
          // Kategorileri ana kategoriler ve alt kategoriler olarak düzenle
          const mainCategories = response.data.items.filter(cat => !cat.parentId);
          
          // Ana kategorilerde alt kategorileri ayarla
          const categoriesWithChildren = mainCategories.map(mainCat => {
            const children = response.data.items.filter(child => child.parentId === mainCat.id);
            return { ...mainCat, children };
          });
          
          setCategories(categoriesWithChildren);
        }
      } catch (err) {
        console.error('Kateqoriyaları yüklenirken hata:', err);
        setError('Kateqoriyaları yükləyərkən xəta baş verdi. Daha sonra yenidən cəhd edin.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Ana kategoriyi genişletme/daraltma
  const toggleCategory = (categoryId) => {
    setExpanded(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  if (loading) {
    return (
      <div className="text-center py-5 container mx-auto">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent">
          <span className="sr-only">Yüklənir...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-5 container mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 container mx-auto">
      <h1 className="mb-4 text-2xl font-bold">Kateqoriyalar</h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div 
              className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
              onClick={() => toggleCategory(category.id)}
            >
              <div className="flex items-center">
                <div className="mr-3 text-blue-600">
                  <FaTags size={18} />
                </div>
                <h2 className="font-medium text-lg">
                  {category.name} 
                  {category.adCount !== undefined && (
                    <span className="ml-2 text-sm text-gray-500">
                      ({category.adCount} elan)
                    </span>
                  )}
                </h2>
              </div>
              <div>
                {expanded[category.id] ? <FaChevronUp /> : <FaChevronDown />}
              </div>
            </div>
            
            {expanded[category.id] && category.children && category.children.length > 0 && (
              <div className="bg-gray-50 border-t">
                <ul className="divide-y divide-gray-200">
                  {category.children.map((subCategory) => (
                    <li key={subCategory.id}>
                      <Link 
                        to={`/ads?categoryId=${subCategory.id}`}
                        className="px-4 py-3 flex justify-between items-center hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          <div className="mr-3 text-gray-500">
                            <FaTag size={14} />
                          </div>
                          <span>
                            {subCategory.name}
                            {subCategory.adCount !== undefined && (
                              <span className="ml-2 text-sm text-gray-500">
                                ({subCategory.adCount} elan)
                              </span>
                            )}
                          </span>
                        </div>
                        <FaChevronRight className="text-gray-400" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="p-3 bg-white border-t flex">
              <Link 
                to={`/ads?categoryId=${category.id}`}
                className="block w-full text-center px-3 py-1.5 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 text-sm transition-colors"
              >
                Bu kateqoriyadakı elanlara baxın
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesList; 