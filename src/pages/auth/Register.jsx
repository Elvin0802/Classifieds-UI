import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FaUserPlus, FaEye, FaEyeSlash } from 'react-icons/fa';
import userService from '../../services/userService';

function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // React Hook Form
  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors } 
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: ''
    }
  });
  
  // Şifre izleme (doğrulama için)
  const password = watch('password');
  
  // Form submit
  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      // Confirm password'ü API'ye göndermeden önce siliyoruz
      const { confirmPassword, ...registerData } = data;
      
      // API'ye kayıt isteği gönderme
      const response = await userService.register(registerData);
      
      if (response.isSucceeded) {
        toast.success('Kaydınız başarıyla oluşturuldu! Giriş yapabilirsiniz.');
        navigate('/giris');
      } else {
        toast.error(response.message || 'Kayıt oluşturulamadı.');
      }
    } catch (error) {
      console.error('Kayıt sırasında hata oluştu:', error);
      toast.error(error.response?.data?.message || 'Kayıt oluşturulamadı. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Şifre görünürlüğünü değiştir
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl font-bold text-center mb-6 justify-center">Kayıt Ol</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* İsim */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">İsim</span>
                </label>
                <input
                  type="text"
                  placeholder="Adınız"
                  className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
                  {...register('name', { 
                    required: 'İsim gereklidir',
                    minLength: {
                      value: 3,
                      message: 'İsim en az 3 karakter olmalıdır'
                    }
                  })}
                />
                {errors.name && <span className="text-error text-sm mt-1">{errors.name.message}</span>}
              </div>
              
              {/* E-posta */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">E-posta</span>
                </label>
                <input
                  type="email"
                  placeholder="E-posta adresiniz"
                  className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`}
                  {...register('email', { 
                    required: 'E-posta adresi gereklidir', 
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Geçerli bir e-posta adresi giriniz'
                    } 
                  })}
                />
                {errors.email && <span className="text-error text-sm mt-1">{errors.email.message}</span>}
              </div>
              
              {/* Telefon Numarası */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Telefon Numarası</span>
                </label>
                <input
                  type="tel"
                  placeholder="Telefon numaranız"
                  className={`input input-bordered w-full ${errors.phoneNumber ? 'input-error' : ''}`}
                  {...register('phoneNumber', { 
                    required: 'Telefon numarası gereklidir'
                  })}
                />
                {errors.phoneNumber && <span className="text-error text-sm mt-1">{errors.phoneNumber.message}</span>}
              </div>
              
              {/* Şifre */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Şifre</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Şifreniz"
                    className={`input input-bordered w-full pr-10 ${errors.password ? 'input-error' : ''}`}
                    {...register('password', { 
                      required: 'Şifre gereklidir',
                      minLength: {
                        value: 6,
                        message: 'Şifre en az 6 karakter olmalıdır'
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
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Şifrenizi tekrar girin"
                    className={`input input-bordered w-full pr-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                    {...register('confirmPassword', { 
                      required: 'Şifre tekrarı gereklidir',
                      validate: value => value === password || 'Şifreler eşleşmiyor'
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
              
              {/* Kayıt Ol Butonu */}
              <div className="form-control mt-6">
                <button 
                  type="submit" 
                  className={`btn btn-primary w-full ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span>Kayıt Yapılıyor...</span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <FaUserPlus className="mr-2" /> Kayıt Ol
                    </span>
                  )}
                </button>
              </div>
            </form>
            
            {/* Giriş Yap Yönlendirmesi */}
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Zaten hesabınız var mı? 
                <Link to="/giris" className="text-primary ml-1 hover:underline">
                  Giriş Yapın
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register; 