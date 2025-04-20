import { FaList, FaMapMarkerAlt, FaFlag, FaChartLine } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function AdminDashboard() {
  // Admin paneli özet kartları
  const cards = [
    {
      title: 'Kategoriler',
      icon: <FaList size={24} className="text-orange-500" />,
      link: '/admin/categories',
      description: 'Kategori ve alt kategori yönetimi',
      color: 'bg-orange-100'
    },
    {
      title: 'Lokasyonlar',
      icon: <FaMapMarkerAlt size={24} className="text-blue-500" />,
      link: '/admin/locations',
      description: 'Lokasyon ekle, çıkar ve düzenle',
      color: 'bg-blue-100'
    },
    {
      title: 'Raporlar',
      icon: <FaFlag size={24} className="text-red-500" />,
      link: '/admin/reports',
      description: 'Kullanıcı raporlarını yönet',
      color: 'bg-red-100'
    }
  ];

  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h1 className="text-2xl font-bold mb-2">Hoş Geldiniz, Admin</h1>
        <p className="text-gray-600">İlan platformu yönetim paneline hoş geldiniz. Aşağıdaki kartlardan ilgili bölümlere erişebilirsiniz.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <Link key={index} to={card.link} className="block">
            <div className={`p-6 rounded-lg shadow-md ${card.color} hover:shadow-lg transition-shadow duration-300`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{card.title}</h2>
                {card.icon}
              </div>
              <p className="text-gray-600">{card.description}</p>
            </div>
          </Link>
        ))}
      </div>
      
      <div className="mt-10 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Hızlı İşlemler</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/admin/categories/create" className="btn btn-primary">Yeni Kategori</Link>
          <Link to="/admin/locations/create" className="btn btn-info">Yeni Lokasyon</Link>
          <Link to="/admin/reports" className="btn btn-accent">Raporlar</Link>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard; 