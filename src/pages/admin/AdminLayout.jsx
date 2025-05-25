import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { FaHome, FaList, FaMapMarkerAlt, FaFlag, FaTachometerAlt, FaBars, FaTimes, FaClock, FaUserSlash } from 'react-icons/fa';
import { Button } from '../../components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';

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
    <div className="min-h-screen bg-muted flex">
      {/* Kenar çubuğu (Sidebar) */}
      <aside
        className={`h-screen sticky top-0 z-30 bg-background border-r border-border flex flex-col items-center py-6 transition-all duration-300 ${isSidebarOpen ? 'w-56' : 'w-16'}`}
      >
        <div className="flex items-center justify-between w-full px-4 mb-8">
          <span className="font-bold text-lg tracking-tight text-primary">{isSidebarOpen ? 'Admin Panel' : 'AP'}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="ml-2"
          >
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </Button>
        </div>
        <nav className="flex-1 w-full">
          <ul className="space-y-2">
            <TooltipProvider>
              <li>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      to="/admin"
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin') && !isActive('/admin/') ? 'bg-accent text-primary' : 'hover:bg-accent/60 text-muted-foreground'}`}
                    >
                      <FaTachometerAlt />
                      {isSidebarOpen && <span>Dashboard</span>}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>Dashboard</TooltipContent>
                </Tooltip>
              </li>
              <li>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      to="/admin/categories"
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/categories') ? 'bg-accent text-primary' : 'hover:bg-accent/60 text-muted-foreground'}`}
                    >
                      <FaList />
                      {isSidebarOpen && <span>Kategoriyalar</span>}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>Kategoriyalar</TooltipContent>
                </Tooltip>
              </li>
              <li>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      to="/admin/locations"
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/locations') ? 'bg-accent text-primary' : 'hover:bg-accent/60 text-muted-foreground'}`}
                    >
                      <FaMapMarkerAlt />
                      {isSidebarOpen && <span>Məkanlar</span>}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>Məkanlar</TooltipContent>
                </Tooltip>
              </li>
              <li>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      to="/admin/ads/pending"
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/ads/pending') ? 'bg-accent text-primary' : 'hover:bg-accent/60 text-muted-foreground'}`}
                    >
                      <FaClock />
                      {isSidebarOpen && <span>Gözləyən Elanlar</span>}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>Gözləyən Elanlar</TooltipContent>
                </Tooltip>
              </li>
              <li>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      to="/admin/reports"
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/reports') ? 'bg-accent text-primary' : 'hover:bg-accent/60 text-muted-foreground'}`}
                    >
                      <FaFlag />
                      {isSidebarOpen && <span>Şikayətlər</span>}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>Şikayətlər</TooltipContent>
                </Tooltip>
              </li>
              <li>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      to="/admin/blocked-users"
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/blocked-users') ? 'bg-accent text-primary' : 'hover:bg-accent/60 text-muted-foreground'}`}
                    >
                      <FaUserSlash />
                      {isSidebarOpen && <span>Blocked Users</span>}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>Blocked Users</TooltipContent>
                </Tooltip>
              </li>
            </TooltipProvider>
          </ul>
        </nav>
      </aside>
      {/* Ana içerik */}
      <div className="flex-1 min-h-screen flex flex-col">
        {/* Üst menü (Header) */}
        <header className="sticky top-0 z-20 bg-background border-b border-border px-6 py-4 flex items-center justify-between shadow-sm">
          <h2 className="text-xl font-semibold text-primary">Admin Paneli</h2>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground font-medium">Admin</span>
            <Button asChild variant="outline" size="sm" className="ml-2">
              <Link to="/">Əsas Səhifəyə Get</Link>
            </Button>
          </div>
        </header>
        {/* Sayfa içeriği */}
        <main className="flex-1 p-8 bg-muted/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout; 