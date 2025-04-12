import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Çıkış yapılırken hata oluştu:', error);
    }
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-800">
              İlanlar
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/ads" className="text-gray-600 hover:text-gray-900">
              Tüm İlanlar
            </Link>
            
            {isAuthenticated() ? (
              <>
                <Link to="/create-ad" className="text-gray-600 hover:text-gray-900">
                  İlan Ekle
                </Link>
                <Link to="/profile" className="text-gray-600 hover:text-gray-900">
                  Profilim
                </Link>
                {user?.role === 'Admin' && (
                  <Link to="/admin" className="text-gray-600 hover:text-gray-900">
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Çıkış Yap
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-gray-900">
                  Giriş Yap
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  Kayıt Ol
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 