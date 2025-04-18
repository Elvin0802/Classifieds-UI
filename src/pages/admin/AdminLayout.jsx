import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { FaHome, FaList, FaMapMarkerAlt, FaUsers, FaAd, FaTachometerAlt, FaBars, FaTimes } from 'react-icons/fa';

function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  
  // Aktif sayfayı kontrol et
  const isActive = (path) => {
    return location.pathname.includes(path);
  };
  
  // Sidebar toggle
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Kenar çubuğu (Sidebar) */}
      <div 
        className={`bg-gray-800 text-white ${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 ease-in-out`}
      >
        <div className="p-4 flex items-center justify-between">
          {isSidebarOpen ? (
            <h1 className="text-xl font-bold">Admin Panel</h1>
          ) : (
            <h1 className="text-xl font-bold">AP</h1>
          )}
          <button 
            onClick={toggleSidebar}
            className="text-white hover:text-gray-300 focus:outline-none"
          >
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
        
        <nav className="mt-6">
          <ul>
            <li>
              <Link 
                to="/admin" 
                className={`flex items-center p-4 ${isActive('/admin') && !isActive('/admin/') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
              >
                <FaTachometerAlt className="mr-4" />
                {isSidebarOpen && <span>Dashboard</span>}
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/categories" 
                className={`flex items-center p-4 ${isActive('/admin/categories') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
              >
                <FaList className="mr-4" />
                {isSidebarOpen && <span>Kategoriler</span>}
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/locations" 
                className={`flex items-center p-4 ${isActive('/admin/locations') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
              >
                <FaMapMarkerAlt className="mr-4" />
                {isSidebarOpen && <span>Lokasyonlar</span>}
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/ads" 
                className={`flex items-center p-4 ${isActive('/admin/ads') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
              >
                <FaAd className="mr-4" />
                {isSidebarOpen && <span>İlanlar</span>}
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/users" 
                className={`flex items-center p-4 ${isActive('/admin/users') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
              >
                <FaUsers className="mr-4" />
                {isSidebarOpen && <span>Kullanıcılar</span>}
              </Link>
            </li>
            <li className="mt-8">
              <Link 
                to="/" 
                className="flex items-center p-4 text-gray-400 hover:bg-gray-700"
              >
                <FaHome className="mr-4" />
                {isSidebarOpen && <span>Ana Sayfaya Dön</span>}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Ana içerik */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        {/* Üst menü (Header) */}
        <div className="bg-white p-4 shadow-md">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Admin Kontrol Paneli</h2>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Admin</span>
            </div>
          </div>
        </div>
        
        {/* Sayfa içeriği */}
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminLayout; 