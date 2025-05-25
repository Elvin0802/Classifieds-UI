import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FaPlus, FaChevronDown, FaShieldAlt, FaEnvelope } from 'react-icons/fa';
import { Menu, Search, Bell, User, LogOut, Settings, ChevronDown, Heart, PlusCircle, ShieldCheck, MessageCircle } from 'lucide-react';
import { cn } from '../ui/utils';
import { Button, buttonVariants } from '../ui/button';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, isAdmin, user, logout, fetchUserData } = useAuth();
  const navigate = useNavigate();

  // Debug: isAdmin değerinin durumunu kontrol et
  useEffect(() => {
    console.log('Header bileşeni isAdmin değeri:', isAdmin);
    console.log('Header bileşeni auth durumu:', { isAuthenticated, isAdmin, userId: user?.id, userName: user?.name });
  }, [isAdmin, isAuthenticated, user]);

  // Sayfa yenilendiğinde kullanıcı verileri eksikse tekrar çek
  useEffect(() => {
    if (isAuthenticated && !user) {
      console.log('Header: Kullanıcı giriş yapmış ama veriler eksik, tekrar getiriliyor');
      fetchUserData();
    }
  }, [isAuthenticated, user, fetchUserData]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Admin paneline doğrudan giriş linki (masaüstü için)
  const AdminLink = () => {
    if (isAuthenticated && isAdmin) {
      return (
        <div className="relative group">
          <Link 
            to="/admin" 
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "flex items-center text-primary bg-blue-50 gap-1 font-medium"
            )}
          >
            <ShieldCheck className="h-4 w-4" /> Admin <ChevronDown className="h-4 w-4" />
          </Link>
          
          <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-20 hidden group-hover:block border border-gray-200">
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
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-primary text-2xl font-bold">
            Classifieds
          </Link>

          {/* Masaüstü Menü */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-primary font-medium">
              Ana Səhifə
            </Link>
            <Link to="/ads" className="text-gray-700 hover:text-primary font-medium">
              Elanlar
            </Link>
            
            {/* Admin paneli linki */}
            {isAdmin && <AdminLink />}
            
            {isAuthenticated ? (
              <>
                <Link to="/ads/create" className={cn(buttonVariants({ size: "sm" }), "gap-1")}>
                  <PlusCircle className="h-4 w-4" /> Elan Paylaş
                </Link>
                <Link to="/messages" className="flex items-center text-gray-700 hover:text-primary gap-1">
                  <MessageCircle className="h-5 w-5" /> Mesajlar
                </Link>
                <Link to="/profile" className="flex items-center text-gray-700 hover:text-primary gap-1">
                  <User className="h-5 w-5" /> Profil
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-red-600 hover:text-red-700 gap-1 px-2 py-1 rounded"
                >
                  <LogOut className="h-5 w-5" /> Çıxış
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                  Giriş
                </Link>
                <Link to="/register" className={cn(buttonVariants({ size: "sm" }))}>
                  Qeydiyyat
                </Link>
              </div>
            )}
          </nav>

          {/* Mobil Menü Butonu */}
          <button
            className="md:hidden text-gray-700 hover:text-primary"
            onClick={toggleMenu}
            aria-label="Ana menyu aç/bağla"
          >
            {isMenuOpen ? <Menu className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobil Menü */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pt-3 border-t border-gray-200 space-y-2">
            <Link to="/" className="block py-2 text-gray-700 hover:text-primary" onClick={toggleMenu}>
              Əsas səhifə
            </Link>
            <Link to="/ads" className="block py-2 text-gray-700 hover:text-primary" onClick={toggleMenu}>
              Elanlar
            </Link>
            
            {/* Mobil Admin Panel Linki */}
            {isAuthenticated && isAdmin && (
              <Link 
                to="/admin" 
                className="flex items-center py-2 font-medium text-blue-700 rounded hover:bg-blue-50 gap-2" 
                onClick={toggleMenu}
              >
                <ShieldCheck className="h-4 w-4" /> Admin Panel
              </Link>
            )}
            
            {isAuthenticated ? (
              <>
                <Link to="/ads/create" className="flex items-center py-2 text-primary font-medium gap-2" onClick={toggleMenu}>
                  <PlusCircle className="h-4 w-4" /> Elan Paylaş
                </Link>
                <Link to="/messages" className="flex items-center py-2 text-gray-700 hover:text-primary gap-2" onClick={toggleMenu}>
                  <MessageCircle className="h-4 w-4" /> Mesajlar
                </Link>
                <Link to="/profile" className="flex items-center py-2 text-gray-700 hover:text-primary gap-2" onClick={toggleMenu}>
                  <User className="h-4 w-4" /> Profil
                </Link>
                <Link to="/favorites" className="flex items-center py-2 text-gray-700 hover:text-primary gap-2" onClick={toggleMenu}>
                  <Heart className="h-4 w-4" /> Seçilmiş Elanlar
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }}
                  className="flex items-center py-2 w-full text-left text-red-600 hover:text-red-700 gap-2"
                >
                  <LogOut className="h-4 w-4" /> Çıxış
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-2 pt-2">
                <Link 
                  to="/login" 
                  className={cn(buttonVariants({ variant: "outline" }))}
                  onClick={toggleMenu}
                >
                  Giriş
                </Link>
                <Link 
                  to="/register" 
                  className={cn(buttonVariants())}
                  onClick={toggleMenu}
                >
                  Qeydiyyat
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}

export default Header; 