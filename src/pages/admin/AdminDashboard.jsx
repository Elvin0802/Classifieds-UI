import { FaList, FaMapMarkerAlt, FaFlag, FaChartLine } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

function AdminDashboard() {
  // Admin paneli özet kartları
  const cards = [
    {
      title: 'Kategoriyalar',
      icon: <FaList size={24} className="text-orange-500" />,
      link: '/admin/categories',
      description: 'Kategoriyaları idarə edin',
      color: 'bg-orange-100'
    },
    {
      title: 'Məkanlar',
      icon: <FaMapMarkerAlt size={24} className="text-blue-500" />,
      link: '/admin/locations',
      description: 'Məkanları idarə edin',
      color: 'bg-blue-100'
    },
    {
      title: 'Raporlar',
      icon: <FaFlag size={24} className="text-red-500" />,
      link: '/admin/reports',
      description: 'Şikayətləri idarə edin',
      color: 'bg-red-100'
    }
  ];

  return (
    <div className="space-y-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Xoş gəldiniz, Admin</CardTitle>
          <CardDescription className="text-base text-muted-foreground mt-2">
            Elan platformasının idarəetmə panelinə xoş gəlmisiniz. Aşağıdakı kartlardan müvafiq bölmələrə daxil ola bilərsiniz.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <Link key={index} to={card.link} className="group">
            <Card className={`transition-all duration-200 border-2 border-transparent hover:border-primary/40 hover:shadow-lg ${card.color}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-semibold text-foreground">{card.title}</span>
                  <span className="rounded-full bg-white p-2 shadow group-hover:bg-primary/10 transition-colors">{card.icon}</span>
                </div>
                <p className="text-muted-foreground text-sm">{card.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      
      <Card className="mt-10">
        <CardHeader>
          <CardTitle className="text-xl font-bold mb-2">Qısayollar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <Button asChild variant="default">
              <Link to="/admin/categories/create">Yeni Kategoriya</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/admin/locations/create">Yeni Məkan</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/reports">Şikayətlər</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminDashboard; 