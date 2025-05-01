import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import authService from '../../services/authService';

function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState('');

  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm({
    defaultValues: {
      email: ''
    }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      // Email formatında veri gönder
      const response = await authService.resetPassword({ email: data.email });
      
      if (response.isSucceeded) {
        setEmail(data.email);
        setIsSubmitted(true);
        toast.success('E-mail ünvanınıza parol sıfırlama linki göndərildi.');
      } else {
        toast.error(response.message || 'Parolun sıfırlanması sorğusu alınmadı.');
      }
    } catch (error) {
      console.error('Şifre sıfırlama isteği sırasında hata:', error);
      toast.error(error.response?.data?.message || 'Xəta baş verdi , təkrar yoxlayın.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl font-bold text-center mb-6 justify-center">
            Şifrəmi unutmuşam
            </h2>
            
            {!isSubmitted ? (
              <div>
                <p className="text-center text-gray-600 mb-6">
                E-mail ünvanınızı daxil edin və biz sizə parol sıfırlama linki göndərəcəyik.
                </p>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">E-mail</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                        <FaEnvelope />
                      </span>
                      <input
                        type="email"
                        placeholder="E-mail"
                        className={`input input-bordered w-full pl-10 ${errors.email ? 'input-error' : ''}`}
                        {...register('email', { 
                          required: 'E-mail gərəklidir.', 
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Etibarlı e-mail daxil edin'
                          } 
                        })}
                      />
                    </div>
                    {errors.email && <span className="text-error text-sm mt-1">{errors.email.message}</span>}
                  </div>
                  
                  <div className="form-control mt-6">
                    <button 
                      type="submit" 
                      className={`btn btn-primary w-full ${isLoading ? 'loading' : ''}`}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Göndərilir...' : 'Parol Sıfırlama Linkini Göndər'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="text-center">
                <div className="bg-success text-white p-3 rounded-lg mb-4">
                  <p className="font-semibold">Parolun sıfırlanması linki göndərildi!</p>
                  <p className="text-sm mt-2">
                    <strong>{email}</strong> -a parol sıfırlama təlimatlarını göndərdik.
                  </p>
                </div>
                <p className="text-gray-600 mb-4">
                Zəhmət olmasa e-poçtunuzu yoxlayın və parolunuzu sıfırlamaq üçün linkə klikləyin.
                </p>
                <p className="text-gray-600 text-sm mb-6">
                E-poçtu almamısınızsa, spam qovluğunuzu yoxlayın və ya bir neçə dəqiqə gözləyin və yenidən cəhd edin.
                </p>
              </div>
            )}
            
            <div className="text-center mt-4">
              <Link to="/giris" className="text-primary hover:underline flex items-center justify-center">
                <FaArrowLeft className="mr-1" /> Giriş səhifəsinə get.
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword; 