import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaSearch } from 'react-icons/fa';
import locationService from '../../services/locationService';

const LocationsList = () => {
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const response = await locationService.getAllLocations();
        
        if (response && response.data && response.data.items) {
          setLocations(response.data.items);
          setFilteredLocations(response.data.items);
        }
      } catch (err) {
        console.error('Lokasyonlar yüklenirken hata:', err);
        setError('Məkanları yükləyərkən xəta baş verdi. Lütfən, sonra yenidən cəhd edin.');
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  // Arama filtreleme
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredLocations(locations);
      return;
    }
    
    const searchTermLower = searchTerm.toLowerCase();
    const filtered = locations.filter(
      location => 
        (location.cityName && location.cityName.toLowerCase().includes(searchTermLower)) ||
        (location.name && location.name.toLowerCase().includes(searchTermLower))
    );
    
    setFilteredLocations(filtered);
  }, [searchTerm, locations]);

  // Arama değişikliği
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading) {
    return (
      <div className="py-5 text-center container mx-auto">
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
      <h1 className="mb-4 text-2xl font-bold">Məkanlar</h1>
      
      {/* Arama kutusu */}
      <div className="mb-4 bg-white rounded-lg shadow p-4">
        <div>
          <div className="flex">
            <div className="relative flex-grow">
              <div className="absolute top-1/2 left-3 transform -translate-y-1/2">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Məkan axtar..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {searchTerm && (
              <button 
                className="ml-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                onClick={() => setSearchTerm('')}
              >
                Təmizlə
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Lokasyon listesi */}
      {filteredLocations.length === 0 ? (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative">
          Axtarış kriteriyalarınıza uyğun məkan tapılmadı.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredLocations.map((location) => (
            <div key={location.id} className="h-full">
              <div className="h-full flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 flex-grow flex flex-col items-center">
                  <div className="mb-3">
                    <FaMapMarkerAlt className="text-blue-600" size={24} />
                  </div>
                  <h3 className="text-lg font-medium mb-1">
                    {location.cityName || location.name}
                  </h3>
                  {location.adCount !== undefined && (
                    <p className="text-gray-500 text-sm">
                      {location.adCount} elan
                    </p>
                  )}
                </div>
                <div className="p-3 bg-white border-t">
                  <Link 
                    to={`/ads?locationId=${location.id}`} 
                    className="block w-full text-center px-3 py-1.5 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 text-sm transition-colors"
                  >
                    Elanlara Bax
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationsList; 