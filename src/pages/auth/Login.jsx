import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { toast } from 'react-toastify';
import { AuthContext } from '../../contexts/AuthContext';
import authService from '../../services/authService';
import authStorage from '../../services/authStorage';
import { clearAccessToken } from '../../services/axiosConfig';
import { Button } from '../../components/ui/button';
import { cn } from '../../components/ui/utils';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  // Redirect sonrası geri dönülecek sayfa (eğer belirtilmişse)
  const from = location.state?.from || '/';
  
  // Sayfa yüklendiğinde herhangi bir kalıntı oturum verisi varsa temizle
  useEffect(() => {
    // Sayfa yüklendiğinde localStorage'dan kalıntı login bilgilerini temizle
    authStorage.clear();
    clearAccessToken();
    console.log('Login sayfası yüklendi: Oturum bilgileri temizlendi');
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // AuthContext'deki login fonksiyonunu kullan
      // Bu fonksiyon authService.login'i içeride çağırıyor zaten
      const loginResult = await login(formData);
      
      if (loginResult.success) {
        // Başarılı giriş sonrası yönlendirme
        toast.success('Giriş uğurlu oldu!');
        navigate(from);
      } else {
        // Login başarısız
        setError(loginResult.message || 'Giriş uğursuz oldu. Zəhmət olmasa məlumatlarınızı yoxlayın.');
      }
    } catch (error) {
      console.error('Giriş sırasında hata:', error);
      
      if (error.response) {
        // API'den gelen hata mesajı
        setError(error.response.data?.message || 'Giriş uğursuz oldu. Zəhmət olmasa məlumatlarınızı yoxlayın.');
      } else {
        setError('Serverə qoşularkən xəta baş verdi. Daha sonra yenidən cəhd edin.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <div className="container max-w-md mx-auto px-4 py-12">
      <div className="bg-white shadow-xl rounded-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <LogIn className="h-6 w-6" /> Giriş Et
          </h1>
          <p className="text-gray-500 mt-2">Hesabınıza baxmaq üçün daxil olun</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* E-posta */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              E-mail
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="E-mail"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
          </div>
          
          {/* Şifre */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Şifrə
              </label>
              <Link to="/sifremi-unuttum" className="text-sm text-primary hover:underline">
              Şifrəmi Unutdum
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Şifrəniz"
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? 
                  <EyeOff className="h-5 w-5 text-gray-400" /> : 
                  <Eye className="h-5 w-5 text-gray-400" />
                }
              </button>
            </div>
          </div>
          
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full py-2 flex items-center justify-center gap-2"
          >
            {loading ? 'Daxil olunur...' : 'Daxil ol'}
            {!loading && <LogIn className="h-5 w-5" />}
          </Button>
          
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Hesabınız yoxdur? 
              <Link to="/kayit" className="text-primary ml-1.5 font-medium hover:underline">
                Qeydiiyatdan Keçin
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 