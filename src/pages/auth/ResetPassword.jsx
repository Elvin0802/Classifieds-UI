import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaKey, FaEye, FaEyeSlash } from 'react-icons/fa';
import authService from '../../services/authService';
import userService from '../../services/userService';

function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [validating, setValidating] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // URL'den token ve email parametrelerini al
  const query = new URLSearchParams(location.search);
  const token = query.get('token');
  const email = query.get('email');
  
  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors } 
  } = useForm({
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });
  
  // Token doğrulama işlemi
  useEffect(() => {
    const validateToken = async () => {
      if (!token || !email) {
        setTokenValid(false);
        setValidating(false);
        return;
      }
      
      try {
        const data = {
          resetToken: token,
          email: email
        };
        const response = await authService.confirmResetToken(data);
        setTokenValid(response.isSucceeded);
        
        if (!response.isSucceeded) {
          toast.error(response.message || 'Geçersiz veya süresi dolmuş bir sıfırlama bağlantısı.');
        }
      } catch (error) {
        console.error('Token doğrulama hatası:', error);
        setTokenValid(false);
        toast.error('Geçersiz veya süresi dolmuş bir sıfırlama bağlantısı. Lütfen yeni bir şifre sıfırlama isteği oluşturun.');
      } finally {
        setValidating(false);
      }
    };
    
    validateToken();
  }, [token, email]);
  
  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      const passwordData = {
        resetToken: token,
        email: email,
        password: data.password,
        passwordConfirm: data.confirmPassword
      };
      
      const response = await userService.updatePassword(passwordData);
      
      if (response.isSucceeded) {
        toast.success('Şifreniz başarıyla sıfırlandı! Yeni şifrenizle giriş yapabilirsiniz.');
        navigate('/giris');
      } else {
        toast.error(response.message || 'Şifre sıfırlama başarısız oldu.');
      }
    } catch (error) {
      console.error('Şifre sıfırlama sırasında hata:', error);
      toast.error(error.response?.data?.message || 'Şifre sıfırlama başarısız oldu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Şifre göster/gizle
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  if (validating) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body text-center">
              <h2 className="card-title text-2xl font-bold text-center mb-6 justify-center">
                Şifre Sıfırlama
              </h2>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              </div>
              <p className="mt-4">Token doğrulanıyor, lütfen bekleyin...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!tokenValid) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body text-center">
              <h2 className="card-title text-2xl font-bold text-center mb-6 justify-center">
                Geçersiz Sıfırlama Bağlantısı
              </h2>
              <div className="text-error mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="mb-4">Bu şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.</p>
              <button 
                onClick={() => navigate('/sifremi-unuttum')} 
                className="btn btn-primary"
              >
                Yeni Sıfırlama Bağlantısı İste
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl font-bold text-center mb-6 justify-center">
              Yeni Şifre Oluştur
            </h2>
            
            <p className="text-center text-gray-600 mb-6">
              {email} hesabınız için yeni bir şifre belirleyin.
            </p>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Yeni Şifre */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Yeni Şifre</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <FaKey />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Yeni şifreniz"
                    className={`input input-bordered w-full pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                    {...register('password', { 
                      required: 'Şifre gereklidir',
                      minLength: {
                        value: 6,
                        message: 'Şifre en az 6 karakter olmalıdır'
                      },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/,
                        message: 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir'
                      }
                    })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <span className="text-error text-sm mt-1">{errors.password.message}</span>}
              </div>
              
              {/* Şifre Tekrar */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Şifre Tekrar</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <FaKey />
                  </span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Şifrenizi tekrar girin"
                    className={`input input-bordered w-full pl-10 pr-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                    {...register('confirmPassword', { 
                      required: 'Şifre tekrarı gereklidir',
                      validate: value => value === watch('password') || 'Şifreler eşleşmiyor'
                    })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirmPassword && <span className="text-error text-sm mt-1">{errors.confirmPassword.message}</span>}
              </div>
              
              <div className="form-control mt-6">
                <button 
                  type="submit" 
                  className={`btn btn-primary w-full ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? 'İşleniyor...' : 'Şifreyi Sıfırla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword; 