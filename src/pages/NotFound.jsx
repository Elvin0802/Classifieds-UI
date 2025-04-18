import { Link } from 'react-router-dom';
import { FaHome, FaSearch } from 'react-icons/fa';

function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-6">Sayfa Bulunamadı</h2>
        <p className="text-gray-600 mb-8">
          Üzgünüz, aradığınız sayfa bulunamadı. Sayfa kaldırılmış, adı değiştirilmiş veya geçici olarak kullanılamıyor olabilir.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="btn btn-primary">
            <FaHome className="mr-2" /> Ana Sayfaya Dön
          </Link>
          <Link to="/ilanlar" className="btn btn-outline">
            <FaSearch className="mr-2" /> İlanları Keşfet
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound; 