import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaPlus, FaBars, FaTimes, FaUserShield, FaChevronDown, FaSearch, FaMapMarkerAlt, FaListUl } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { categoryService, locationService } from '../../services';

const Header = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Kategorileri getir
        const categoriesResponse = await categoryService.getAllCategories();
        setCategories(categoriesResponse.categories || []);
        
        // Konumları getir
        const locationsResponse = await locationService.getAllLocations();
        setLocations(locationsResponse.locations || locationsResponse.items || []);
      } catch (error) {
        console.error("Veriler yüklenirken hata:", error);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };
  
  const closeProfileMenu = () => {
    setIsProfileMenuOpen(false);
  };

  const toggleSearchBox = () => {
    setShowSearchBox(!showSearchBox);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Arama parametrelerini oluştur
    const searchParams = new URLSearchParams();
    
    if (searchTerm && searchTerm.trim() !== '') {
      searchParams.append('searchTerm', searchTerm);
    }
    
    if (selectedLocation && selectedLocation !== '') {
      searchParams.append('locationId', selectedLocation);
    }
    
    if (selectedCategory && selectedCategory !== '') {
      searchParams.append('categoryId', selectedCategory);
    }
    
    // İlanlar sayfasına yönlendir
    navigate(`/ads?${searchParams.toString()}`);
    setShowSearchBox(false);
  };

  return (
    <header className="bg-dark text-white shadow-md">
      <div className="container-custom py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">İlanlar</Link>
          
          {/* Search Bar - Mobile */}
          <div className="md:hidden flex items-center">
            <button
              className="text-white mr-4 focus:outline-none"
              onClick={toggleSearchBox}
            >
              <FaSearch size={20} />
            </button>
            
            {/* Mobile menu button */}
            <button 
              className="text-white focus:outline-none"
              onClick={toggleMenu}
            >
              {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
          
          {/* Search Bar - Desktop */}
          <div className="hidden md:flex items-center space-x-4 flex-1 max-w-3xl mx-auto">
            <div className="relative w-full">
              <form onSubmit={handleSearch} className="flex items-center">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Ne aramıştınız?"
                    className="py-2 px-4 pr-10 w-full rounded-l-md text-gray-800 focus:outline-none"
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  />
                  <button
                    type="submit"
                    className="absolute right-0 top-0 h-full px-3 text-gray-600 hover:text-primary"
                  >
                    <FaSearch />
                  </button>
                </div>
                
                {/* Category Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    className="flex items-center bg-white text-gray-800 py-2 px-3 border-l border-gray-300 h-full"
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  >
                    <FaListUl className="mr-2" />
                    <span className="hidden sm:inline">
                      {selectedCategory 
                        ? categories.find(c => c.id === selectedCategory)?.name || 'Kategori'
                        : 'Kategori'}
                    </span>
                    <FaChevronDown className="ml-2" />
                  </button>
                  
                  {isCategoryOpen && (
                    <div className="absolute z-30 mt-1 left-0 bg-white rounded-md shadow-lg p-2 w-60 text-gray-800">
                      <div className="font-semibold px-3 py-1">Kategoriler</div>
                      <div className="max-h-60 overflow-y-auto">
                        {categories.map(category => (
                          <div 
                            key={category.id}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                            onClick={() => {
                              setSelectedCategory(category.id);
                              setIsCategoryOpen(false);
                            }}
                          >
                            <span>{category.name}</span>
                            {category.id === selectedCategory && (
                              <span className="text-primary">✓</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Location Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    className="flex items-center bg-white text-gray-800 py-2 px-3 border-l border-gray-300 h-full rounded-r-md"
                    onClick={() => setIsLocationOpen(!isLocationOpen)}
                  >
                    <FaMapMarkerAlt className="mr-2" />
                    <span className="hidden sm:inline">
                      {selectedLocation 
                        ? locations.find(l => l.id === selectedLocation)?.city || 'Konum'
                        : 'Konum'}
                    </span>
                    <FaChevronDown className="ml-2" />
                  </button>
                  
                  {isLocationOpen && (
                    <div className="absolute z-30 mt-1 right-0 bg-white rounded-md shadow-lg p-2 w-60 text-gray-800">
                      <div className="font-semibold px-3 py-1">Şehirler</div>
                      <div className="max-h-60 overflow-y-auto">
                        {locations.map(location => (
                          <div 
                            key={location.id}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                            onClick={() => {
                              setSelectedLocation(location.id);
                              setIsLocationOpen(false);
                            }}
                          >
                            <span>{location.city}</span>
                            {location.id === selectedLocation && (
                              <span className="text-primary">✓</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/create-ad" 
              className="bg-primary text-dark hover:bg-primary-dark px-4 py-2 rounded-md font-medium flex items-center"
            >
              <FaPlus className="mr-2" />
              İlan Ver
            </Link>
            
            {isAuthenticated ? (
              <div className="relative">
                <button 
                  className="flex items-center hover:text-gray-300 focus:outline-none" 
                  onClick={toggleProfileMenu}
                >
                  <FaUser className="mr-2" />
                  <span>Hesabım</span>
                  <FaChevronDown className="ml-2" />
                </button>
                
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-20 text-gray-800">
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 hover:bg-gray-100 flex items-center"
                      onClick={closeProfileMenu}
                    >
                      <FaUser className="mr-2" />
                      Profilim
                    </Link>
                    <Link
                      to="/admin/dashboard"
                      className="block px-4 py-2 hover:bg-gray-100 flex items-center"
                      onClick={closeProfileMenu}
                    >
                      <FaUserShield className="mr-2" />
                      Admin Paneli
                    </Link>
                    <button 
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center" 
                      onClick={handleLogout}
                    >
                      <FaSignOutAlt className="mr-2" />
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="hover:text-gray-300">Giriş Yap</Link>
            )}
          </nav>
        </div>
        
        {/* Mobile Search Container */}
        {showSearchBox && (
          <div className="md:hidden pt-4 pb-2">
            <form onSubmit={handleSearch} className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ne aramıştınız?"
                  className="py-2 px-4 pr-10 w-full rounded-md text-gray-800 focus:outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-0 top-0 h-full px-3 text-gray-600 hover:text-primary"
                >
                  <FaSearch />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <select
                    className="w-full py-2 px-3 rounded-md text-gray-800 focus:outline-none appearance-none"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">Tüm Kategoriler</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <FaChevronDown className="text-gray-500" />
                  </div>
                </div>
                
                <div className="relative">
                  <select
                    className="w-full py-2 px-3 rounded-md text-gray-800 focus:outline-none appearance-none"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                  >
                    <option value="">Tüm Şehirler</option>
                    {locations.map(location => (
                      <option key={location.id} value={location.id}>
                        {location.city}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <FaChevronDown className="text-gray-500" />
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-2 border-t border-gray-700 mt-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/create-ad" 
                className="w-full bg-primary text-dark hover:bg-primary-dark px-4 py-2 rounded-md font-medium flex items-center justify-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <FaPlus className="mr-2" />
                İlan Ver
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/profile" 
                    className="flex items-center hover:text-gray-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaUser className="mr-2" />
                    Profilim
                  </Link>
                  <Link
                    to="/admin/dashboard"
                    className="flex items-center hover:text-gray-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaUserShield className="mr-2" />
                    Admin Paneli
                  </Link>
                  <button 
                    className="flex items-center hover:text-gray-300 text-left" 
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt className="mr-2" />
                    Çıkış Yap
                  </button>
                </>
              ) : (
                <Link 
                  to="/login" 
                  className="hover:text-gray-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Giriş Yap
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 