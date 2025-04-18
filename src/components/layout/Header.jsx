import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FaBars, FaTimes, FaUser, FaSignOutAlt, FaPlus } from 'react-icons/fa';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-primary text-2xl font-bold">
            İlanlar
          </Link>

          {/* Masaüstü Menü */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-primary">
              Ana Sayfa
            </Link>
            <Link to="/ilanlar" className="text-gray-700 hover:text-primary">
              İlanlar
            </Link>
            <Link to="/ilanlar" className="text-gray-700 hover:text-primary">
              Kategoriler
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/ilanlar/yeni" className="flex items-center bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark">
                  <FaPlus className="mr-2" /> İlan Ekle
                </Link>
                
                <div className="relative group">
                  <button className="flex items-center text-gray-700 hover:text-primary">
                    <FaUser className="mr-2" /> 
                    {user?.name || 'Hesabım'}
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-20 hidden group-hover:block">
                    <Link to="/profil" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Profilim
                    </Link>
                    <Link to="/ilanlar" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      İlanlarım
                    </Link>
                    <Link to="/ilanlar/favori" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Favorilerim
                    </Link>
                    
                    {isAdmin && (
                      <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Admin Paneli
                      </Link>
                    )}
                    
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FaSignOutAlt className="inline mr-2" /> Çıkış Yap
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/giris" className="text-gray-700 hover:text-primary">
                  Giriş Yap
                </Link>
                <Link to="/kayit" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark">
                  Kayıt Ol
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
              Ana Sayfa
            </Link>
            <Link to="/ilanlar" className="block py-2 text-gray-700 hover:text-primary" onClick={toggleMenu}>
              İlanlar
            </Link>
            <Link to="/ilanlar" className="block py-2 text-gray-700 hover:text-primary" onClick={toggleMenu}>
              Kategoriler
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/ilanlar/yeni" className="block py-2 text-primary font-medium" onClick={toggleMenu}>
                  <FaPlus className="inline mr-2" /> İlan Ekle
                </Link>
                <Link to="/profil" className="block py-2 text-gray-700 hover:text-primary" onClick={toggleMenu}>
                  Profilim
                </Link>
                <Link to="/ilanlar" className="block py-2 text-gray-700 hover:text-primary" onClick={toggleMenu}>
                  İlanlarım
                </Link>
                <Link to="/ilanlar/favori" className="block py-2 text-gray-700 hover:text-primary" onClick={toggleMenu}>
                  Favorilerim
                </Link>
                
                {isAdmin && (
                  <Link to="/admin" className="block py-2 text-gray-700 hover:text-primary" onClick={toggleMenu}>
                    Admin Paneli
                  </Link>
                )}
                
                <button
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }}
                  className="block w-full text-left py-2 text-gray-700 hover:text-primary"
                >
                  <FaSignOutAlt className="inline mr-2" /> Çıkış Yap
                </button>
              </>
            ) : (
              <>
                <Link to="/giris" className="block py-2 text-gray-700 hover:text-primary" onClick={toggleMenu}>
                  Giriş Yap
                </Link>
                <Link to="/kayit" className="block py-2 text-primary font-medium" onClick={toggleMenu}>
                  Kayıt Ol
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