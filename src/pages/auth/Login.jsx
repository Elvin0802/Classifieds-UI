import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaSignInAlt, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { AuthContext } from '../../contexts/AuthContext';
import authService from '../../services/authService';

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
      // API'ye login isteği
      const response = await authService.login(formData);
      
      // Token artık axiosConfig tarafından otomatik olarak alınıp saklanacak
      // AuthContext state'ini güncelleyelim
      await login(formData);
      
      // Başarılı giriş sonrası yönlendirme
      toast.success('Giriş başarılı!');
      navigate(from);
    } catch (error) {
      console.error('Giriş sırasında hata:', error);
      
      if (error.response) {
        // API'den gelen hata mesajı
        setError(error.response.data?.message || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.');
      } else {
        setError('Sunucuya bağlanırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl font-bold text-center mb-6 justify-center">
              <FaSignInAlt className="mr-2" /> Giriş Yap
            </h2>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* E-posta */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">E-posta</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <FaEnvelope />
                  </span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="E-posta adresiniz"
                    className="input input-bordered w-full pl-10"
                    required
                  />
                </div>
              </div>
              
              {/* Şifre */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Şifre</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <FaLock />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Şifreniz"
                    className="input input-bordered w-full pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              
              <div className="form-control mt-6">
                <button 
                  type="submit" 
                  className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
                  disabled={loading}
                >
                  {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                </button>
              </div>
            </form>
            
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600 mb-2">
                Hesabınız yok mu? 
                <Link to="/kayit" className="text-primary ml-1 hover:underline">
                  Kayıt Ol
                </Link>
              </p>
              <Link to="/sifremi-unuttum" className="text-primary text-sm hover:underline">
                Şifremi Unuttum
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 