import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaTrash, FaEye, FaSearch, FaMapMarkerAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import locationService from '../../../services/locationService';

function AdminLocations() {
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Lokasyonları yükle
  const fetchLocations = async () => {
    setLoading(true);
    try {
      const response = await locationService.getAllLocations();
      setLocations(response.data.items || []);
    } catch (error) {
      console.error('Lokasyonlar alınırken hata:', error);
      toast.error('Lokasyonlar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchLocations();
  }, []);
  
  // Lokasyon silme
  const handleDeleteLocation = async (locationId) => {
    if (window.confirm('Bu lokasyonu silmek istediğinizden emin misiniz?')) {
      try {
        await locationService.deleteLocation(locationId);
        toast.success('Lokasyon başarıyla silindi.');
        fetchLocations(); // Tabloyu yenile
      } catch (error) {
        console.error('Lokasyon silinirken hata:', error);
        toast.error('Lokasyon silinemedi. Bir hata oluştu.');
      }
    }
  };
  
  // Filtrelenmiş lokasyonları getir
  const getFilteredLocations = () => {
    if (!searchTerm.trim()) {
      return locations;
    }
    
    const searchLower = searchTerm.toLowerCase();
    return locations.filter(location => 
      location.name.toLowerCase().includes(searchLower) || 
      (location.description && location.description.toLowerCase().includes(searchLower)) ||
      (location.code && location.code.toLowerCase().includes(searchLower))
    );
  };
  
  const filteredLocations = getFilteredLocations();
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Lokasyon Yönetimi</h1>
        
        <div className="flex gap-2">
          <Link to="/admin/locations/create" className="btn btn-primary btn-sm">
            <FaPlus className="mr-2" /> Yeni Lokasyon
          </Link>
        </div>
      </div>
      
      {/* Arama */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="flex items-center text-gray-600">
            <FaMapMarkerAlt className="mr-2" /> Toplam {locations.length} lokasyon bulundu
          </div>
          
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Lokasyon ara..."
              className="input input-bordered w-full pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
          </div>
        </div>
      </div>
      
      {/* Lokasyon Tablosu */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {filteredLocations.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <p className="text-gray-600">Lokasyon bulunamadı. Yeni bir lokasyon ekleyin.</p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-lg shadow-md">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th className="w-16"></th>
                    <th>Lokasyon Adı</th>
                    <th>Kod</th>
                    <th>Açıklama</th>
                    <th>Üst Lokasyon</th>
                    <th className="w-24">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLocations.map((location) => (
                    <tr key={location.id}>
                      <td>
                        <FaMapMarkerAlt className="text-blue-500" size={20} />
                      </td>
                      <td className="font-medium">{location.name}</td>
                      <td>{location.code || '-'}</td>
                      <td className="max-w-xs truncate">{location.description || '-'}</td>
                      <td>{location.parentName || '-'}</td>
                      <td>
                        <div className="flex space-x-2">
                          <Link 
                            to={`/admin/locations/${location.id}`} 
                            className="btn btn-ghost btn-xs"
                          >
                            <FaEye className="text-blue-500" />
                          </Link>
                          <button 
                            onClick={() => handleDeleteLocation(location.id)}
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

export default AdminLocations; 