import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
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
  const [userEmail, setUserEmail] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  
  // URL parametrelerinden veya query string'den token ve email/userId bilgilerini al
  const query = new URLSearchParams(location.search);
  // Query string'den gelen bilgiler
  const queryToken = query.get('token');
  const queryEmail = query.get('email');
  
  // Path parametrelerinden gelen bilgiler (update-password/:userId/:token)
  const pathUserId = params.userId;
  const pathToken = params.token;
  
  // Kullanılacak token ve userId/email değerlerini belirle
  const token = pathToken || queryToken;
  const userId = pathUserId;
  const email = queryEmail;
  
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
      if (!token) {
        setTokenValid(false);
        setValidating(false);
        return;
      }
      
      try {
        let data;
        
        // URL formatına göre doğrulama yapalım
        if (userId) {
          // update-password/:userId/:token formatı için
          data = {
            resetToken: token,
            userId: userId
          };
        } else if (email) {
          // reset-password?token=xxx&email=xxx formatı için
          data = {
            resetToken: token,
            email: email
          };
        } else {
          throw new Error('Email veya userId bilgisi eksik');
        }
        
        const response = await authService.confirmResetToken(data);
        setTokenValid(response.isSucceeded);
        
        // Email bilgisini kaydet
        if (response.isSucceeded && response.data && response.data.email) {
          setUserEmail(response.data.email);
        } else if (email) {
          setUserEmail(email);
        }
        
        if (!response.isSucceeded) {
          toast.error(response.message || 'Yanlış və ya vaxtı keçmiş sıfırlama bağlantısı.');
        }
      } catch (error) {
        console.error('Token doğrulama hatası:', error);
        setTokenValid(false);
        toast.error('Yanlış və ya vaxtı keçmiş sıfırlama bağlantısı. Yeni parol sıfırlama sorğusu yaradın.');
      } finally {
        setValidating(false);
      }
    };
    
    validateToken();
  }, [token, email, userId]);
  
  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      let passwordData;
      
      // URL formatına göre istek gönderelim
      if (userId) {
        // update-password/:userId/:token formatı için
        passwordData = {
          resetToken: token,
          userId: userId,
          password: data.password,
          passwordConfirm: data.confirmPassword
        };
      } else {
        // reset-password?token=xxx&email=xxx formatı için
        passwordData = {
          resetToken: token,
          email: userEmail || email,
          password: data.password,
          passwordConfirm: data.confirmPassword
        };
      }
      
      const response = await userService.updatePassword(passwordData);
      
      if (response.isSucceeded) {
        toast.success('Parolunuz uğurla sıfırlandı! Yeni parolunuzla daxil ola bilərsiniz.');
        navigate('/giris');
      } else {
        toast.error(response.message || 'Parolun sıfırlanması uğursuz oldu.');
      }
    } catch (error) {
      console.error('Şifre sıfırlama sırasında hata:', error);
      toast.error(error.response?.data?.message || 'Parolun sıfırlanması uğursuz oldu.');
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
                Şifrə Sıfırlama
              </h2>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              </div>
              <p className="mt-4">Token təsdiqlənir, gözləyin...</p>
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
              Yanlış Sıfırlama Linki
              </h2>
              <div className="text-error mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="mb-4">Bu parol sıfırlama linki etibarsızdır və ya vaxtı keçmişdir.</p>
              <button 
                onClick={() => navigate('/sifremi-unuttum')} 
                className="btn btn-primary"
              >
                Yeni Sıfırlama Linkini tələb edin
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
              Yeni Şifrə Yarat
            </h2>
            
            <p className="text-center text-gray-600 mb-6">
              {userEmail || "Hesabınız"} üçün yeni parol təyin edin.
            </p>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Yeni Şifre */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Yeni Şifrə</span>
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
                      required: 'Şifrə məcburidir',
                      minLength: {
                        value: 6,
                        message: 'Şifrə ən az 6 simvol olmalıdır'
                      },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/,
                        message: 'Parolda ən azı bir böyük hərf, bir kiçik hərf və bir rəqəm olmalıdır'
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
                    placeholder="Şifrənizi təkrar girin"
                    className={`input input-bordered w-full pl-10 pr-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                    {...register('confirmPassword', { 
                      required: 'Şifre təkrarı məcburidir',
                      validate: value => value === watch('password') || 'Şifrələr uyğunlaşmır'
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
                  {isLoading ? 'Emal olunur...' : 'Şifrəni Sıfırla'}
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