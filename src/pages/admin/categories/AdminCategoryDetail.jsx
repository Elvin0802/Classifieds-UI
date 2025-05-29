import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import categoryService from '../../../services/categoryService';

function AdminCategoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Aktif tab bilgisini location.state ile al
  const activeTab = location.state?.activeTab || 'all';

  useEffect(() => {
    const fetchCategory = async () => {
      setLoading(true);
      try {
        let response;
        if (activeTab === 'main') {
          response = await categoryService.getMainCategoryById(id);
        } else if (activeTab === 'sub') {
          response = await categoryService.getSubCategoryById(id);
        } else {
          response = await categoryService.getCategoryById(id);
        }
        setCategory(response.data.item);
      } catch (err) {
        setError('Kategoriya tapılmadı.');
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [id, activeTab]);

  return (
    <div className="container mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="btn btn-outline mb-4 flex items-center gap-2">
        <FaArrowLeft /> Geri
      </button>
      <h1 className="text-2xl font-bold mb-6">Kategoriya Detayı</h1>
      {loading ? (
        <div>Yüklənir...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : category ? (
        activeTab === 'sub' ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div><b>ID:</b> {category.id}</div>
            <div><b>Adı:</b> {category.name}</div>
            <div><b>Tip:</b> {category.type}</div>
            <div><b>Məcburi:</b> {category.isRequired ? 'Bəli' : 'Xeyr'}</div>
            <div><b>Axtarışda:</b> {category.isSearchable ? 'Bəli' : 'Xeyr'}</div>
            <div><b>Sort Order:</b> {category.sortOrder}</div>
            <div><b>Main Category ID:</b> {category.mainCategoryId}</div>
            <div><b>Yaradılma Tarixi:</b> {category.createdAt}</div>
            <div><b>Güncellenme Tarixi:</b> {category.updatedAt}</div>
            {/* Options */}
            {category.options && category.options.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium mb-2">Seçimlər</h3>
                <table className="min-w-full bg-white border border-gray-200 rounded">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 border-b">ID</th>
                      <th className="px-3 py-2 border-b">Value</th>
                      <th className="px-3 py-2 border-b">Sort</th>
                      <th className="px-3 py-2 border-b">Yaradılma</th>
                      <th className="px-3 py-2 border-b">Güncellenme</th>
                    </tr>
                  </thead>
                  <tbody>
                    {category.options.map(opt => (
                      <tr key={opt.id}>
                        <td className="px-3 py-2 border-b">{opt.id}</td>
                        <td className="px-3 py-2 border-b">{opt.value}</td>
                        <td className="px-3 py-2 border-b">{opt.sortOrder}</td>
                        <td className="px-3 py-2 border-b">{opt.createdAt}</td>
                        <td className="px-3 py-2 border-b">{opt.updatedAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div><b>ID:</b> {category.id}</div>
            <div><b>Adı:</b> {category.name}</div>
            <div><b>Açıqlama:</b> {category.description || '-'}</div>
            <div><b>Slug:</b> {category.slug}</div>
            <div><b>Yaradılma Tarixi:</b> {category.createdAt}</div>
            <div><b>Güncellenme Tarixi:</b> {category.updatedAt}</div>
            {/* Main Categories */}
            {category.mainCategories && category.mainCategories.length > 0 && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-2">Əsas Kategoriyalar</h2>
                {category.mainCategories.map(main => (
                  <div key={main.id} className="border rounded p-4 mb-4 bg-gray-50">
                    <div><b>ID:</b> {main.id}</div>
                    <div><b>Adı:</b> {main.name}</div>
                    <div><b>Slug:</b> {main.slug}</div>
                    <div><b>Parent Category ID:</b> {main.parentCategoryId}</div>
                    <div><b>Yaradılma Tarixi:</b> {main.createdAt}</div>
                    <div><b>Güncellenme Tarixi:</b> {main.updatedAt}</div>
                    {/* Sub Categories */}
                    {main.subCategories && main.subCategories.length > 0 && (
                      <div className="mt-4">
                        <h3 className="font-medium mb-1">Alt Kategoriyalar</h3>
                        {main.subCategories.map(sub => (
                          <div key={sub.id} className="border rounded p-3 mb-2 bg-white">
                            <div><b>ID:</b> {sub.id}</div>
                            <div><b>Adı:</b> {sub.name}</div>
                            <div><b>Tip:</b> {sub.type}</div>
                            <div><b>Məcburi:</b> {sub.isRequired ? 'Bəli' : 'Xeyr'}</div>
                            <div><b>Axtarışda:</b> {sub.isSearchable ? 'Bəli' : 'Xeyr'}</div>
                            <div><b>Sort Order:</b> {sub.sortOrder}</div>
                            <div><b>Main Category ID:</b> {sub.mainCategoryId}</div>
                            <div><b>Yaradılma Tarixi:</b> {sub.createdAt}</div>
                            <div><b>Güncellenme Tarixi:</b> {sub.updatedAt}</div>
                            {/* Options */}
                            {sub.options && sub.options.length > 0 && (
                              <div className="mt-2">
                                <b>Seçimlər:</b>
                                <ul className="list-disc ml-6">
                                  {sub.options.map(opt => (
                                    <li key={opt.id}>
                                      <b>Value:</b> {opt.value} <b>Sort:</b> {opt.sortOrder} <b>ID:</b> {opt.id}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      ) : null}
    </div>
  );
}

export default AdminCategoryDetail; 