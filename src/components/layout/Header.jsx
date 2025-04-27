import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FaBars, FaTimes, FaUser, FaSignOutAlt, FaPlus, FaChevronDown, FaShieldAlt, FaEnvelope } from 'react-icons/fa';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const profileMenuRef = useRef(null);

  // Debug: isAdmin değerinin durumunu kontrol et
  useEffect(() => {
    console.log('Header bileşeni isAdmin değeri:', isAdmin);
    console.log('Header bileşeni auth durumu:', { isAuthenticated, isAdmin, userId: user?.id, userName: user?.name });
  }, [isAdmin, isAuthenticated, user]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Profil menüsü dışına tıklandığında menüyü kapat
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Admin paneline doğrudan giriş linki (masaüstü için)
  const AdminLink = () => {
    if (isAuthenticated && isAdmin) {
      return (
        <div className="relative group">
          <Link 
            to="/admin" 
            className="flex items-center text-primary bg-blue-50 px-4 py-2 rounded-md hover:bg-blue-100"
          >
            <FaShieldAlt className="mr-2" /> Admin <FaChevronDown className="ml-2" />
          </Link>
          
          <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-20 hidden group-hover:block">
            <Link 
              to="/admin" 
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Dashboard
            </Link>
            <Link 
              to="/admin/categories" 
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Categories
            </Link>
            <Link 
              to="/admin/locations" 
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Locations
            </Link>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-primary text-2xl font-bold">
            Classifieds
          </Link>

          {/* Masaüstü Menü */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-primary">
              Home
            </Link>
            <Link to="/ads" className="text-gray-700 hover:text-primary">
              Ads
            </Link>
            <Link to="/ads" className="text-gray-700 hover:text-primary">
              Categories
            </Link>
            
            {/* Admin paneli linki */}
            {isAdmin && <AdminLink />}
            
            {isAuthenticated ? (
              <>
                <Link to="/ads/create" className="flex items-center bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark">
                  <FaPlus className="mr-2" /> Post Ad
                </Link>
                
                {/* Mesajlar Butonu */}
                <Link to="/messages" className="flex items-center text-gray-700 hover:text-primary">
                  <FaEnvelope className="mr-2" /> Messages
                </Link>
                
                <div className="relative" ref={profileMenuRef}>
                  <button 
                    className="flex items-center text-gray-700 hover:text-primary"
                    onClick={toggleProfileMenu}
                  >
                    <FaUser className="mr-2" /> 
                    {user?.name || 'Account'} 
                    <FaChevronDown className="ml-1" />
                  </button>
                  
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-20">
                      <Link 
                        to="/profile" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link 
                        to="/ads" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        My Ads
                      </Link>
                      <Link 
                        to="/favorites" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Favorites
                      </Link>
                      
                      {/* Dropdown'a da Mesajlar Link'i ekleyelim */}
                      <Link 
                        to="/messages" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <FaEnvelope className="inline mr-2" /> Messages
                      </Link>
                      
                      {isAdmin && (
                        <Link 
                          to="/admin" 
                          className="block px-4 py-2 text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <FaShieldAlt className="inline mr-2" /> Admin Panel
                        </Link>
                      )}
                      
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsProfileMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <FaSignOutAlt className="inline mr-2" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-primary">
                  Login
                </Link>
                <Link to="/register" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark">
                  Register
                </Link>
              </div>
            )}
          </nav>

          {/* Mobil Menü Butonu */}
          <button
            className="md:hidden text-gray-700 hover:text-primary"
            onClick={toggleMenu}
            aria-label="Ana menüyü aç/kapat"
          >
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobil Menü */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 space-y-2">
            <Link to="/" className="block py-2 text-gray-700 hover:text-primary" onClick={toggleMenu}>
              Home
            </Link>
            <Link to="/ads" className="block py-2 text-gray-700 hover:text-primary" onClick={toggleMenu}>
              Ads
            </Link>
            <Link to="/ads" className="block py-2 text-gray-700 hover:text-primary" onClick={toggleMenu}>
              Categories
            </Link>
            
            {/* Mobil Admin Panel Linki */}
            {isAuthenticated && isAdmin && (
              <Link 
                to="/admin" 
                className="block py-2 font-bold text-blue-700 bg-blue-50 px-2 rounded hover:bg-blue-100" 
                onClick={toggleMenu}
              >
                <FaShieldAlt className="inline mr-2" /> Admin Panel
              </Link>
            )}
            
            {isAuthenticated ? (
              <>
                <Link to="/ads/create" className="block py-2 text-primary font-medium" onClick={toggleMenu}>
                  <FaPlus className="inline mr-2" /> Post Ad
                </Link>
                
                {/* Mobil Menüye Mesajlar linki ekliyoruz */}
                <Link to="/messages" className="block py-2 text-gray-700 hover:text-primary" onClick={toggleMenu}>
                  <FaEnvelope className="inline mr-2" /> Messages
                </Link>
                
                <Link to="/profile" className="block py-2 text-gray-700 hover:text-primary" onClick={toggleMenu}>
                  Profile
                </Link>
                <Link to="/ads" className="block py-2 text-gray-700 hover:text-primary" onClick={toggleMenu}>
                  My Ads
                </Link>
                <Link to="/favorites" className="block py-2 text-gray-700 hover:text-primary" onClick={toggleMenu}>
                  Favorites
                </Link>
                
                <button
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }}
                  className="block w-full text-left py-2 text-gray-700 hover:text-primary"
                >
                  <FaSignOutAlt className="inline mr-2" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 text-gray-700 hover:text-primary" onClick={toggleMenu}>
                  Login
                </Link>
                <Link to="/register" className="block py-2 text-primary font-medium" onClick={toggleMenu}>
                  Register
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}

export default Header; 