import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, ChevronDown } from 'lucide-react';
import locationService from '../../services/locationService';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';

const SearchBar = ({ categories, locations: propLocations }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locations, setLocations] = useState(propLocations || []);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (propLocations && propLocations.length > 0) {
      setLocations(propLocations);
      return;
    }
    
    const fetchLocations = async () => {
      setLoading(true);
      try {
        const response = await locationService.getAll();
        if (response && response.data && response.data.items) {
          setLocations(response.data.items);
        }
      } catch (error) {
        console.error('Lokasyonlar yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [propLocations]);

  const handleSearch = (e) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    
    if (searchTerm) {
      params.append('q', searchTerm);
    }
    
    if (selectedLocation) {
      params.append('locationId', selectedLocation);
    }
    
    navigate(`/ads?${params.toString()}`);
  };

  // Seçilen lokasyonu bul
  const selectedLocationName = locations.find(loc => loc.id === selectedLocation)
    ? `${locations.find(loc => loc.id === selectedLocation).city}`
    : 'Hamısı';

  return (
    <form onSubmit={handleSearch} className="bg-white shadow-xl rounded-xl p-3 md:p-2 w-full max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Ne aramıştınız?"
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 placeholder-gray-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="relative">
          <div className="relative">
            <button
              type="button"
              className="flex items-center justify-between w-full md:w-48 px-3 py-3 bg-white border border-gray-300 rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-primary"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-900 truncate">{selectedLocationName}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500 ml-2" />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-lg overflow-auto border border-gray-200">
                <div className="py-1">
                  <button
                    type="button"
                    className="w-full px-4 py-2 text-left text-gray-900 hover:bg-gray-100"
                    onClick={() => {
                      setSelectedLocation('');
                      setIsDropdownOpen(false);
                    }}
                  >
                    Tüm Türkiye
                  </button>
                  
                  {loading ? (
                    <div className="px-4 py-2 text-gray-500">Yüklənir...</div>
                  ) : (
                    locations.map((location) => (
                      <button
                        key={location.id}
                        type="button"
                        className="w-full px-4 py-2 text-left text-gray-900 hover:bg-gray-100"
                        onClick={() => {
                          setSelectedLocation(location.id);
                          setIsDropdownOpen(false);
                        }}
                      >
                        {location.city}, {location.country}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="flex-shrink-0 py-3 px-6"
        >
          <Search className="h-5 w-5 mr-2" /> Axtar
        </Button>
      </div>
    </form>
  );
};

export default SearchBar; 