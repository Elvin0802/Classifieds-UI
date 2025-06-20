import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, UserPlus, Phone } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '../../components/ui/button';
import userService from '../../services/userService';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Girilen değer değiştiğinde o alan için hata mesajını temizle
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Ad kontrolü
    if (!formData.name.trim()) {
      newErrors.name = 'Ad mütləq olmalıdır';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Adda ən az 2 hərf olmalıdır';
    }
    
    // E-posta kontrolü
    if (!formData.email) {
      newErrors.email = 'E-mail mütləq olmalıdır';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Düzgün email daxil edin';
    }
    
    // Telefon kontrolü
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Telefon nömrəsi mütləq olmalıdır';
    }
    
    // Şifre kontrolü
    if (!formData.password) {
      newErrors.password = 'Şifre mütləq olmalıdır';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Şifre ən az 6 simvol olmalidir';
    }
    
    // Şifre onay kontrolü
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifre təsdiqi mütləq olmalıdır';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifrələr uyğunlaşmır';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await userService.register({
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password
      });
      if (response.isSucceeded) {
        setShowVerify(true);
        setVerifyEmail(formData.email);
        toast.success('Email adresinize doğrulama kodu gönderildi. Lütfen kodu girin.');
      } else {
        const errorMessage = response.message || 'Qeydiyyat zamanı xəta baş verdi';
        toast.error(errorMessage);
        if (response.errors) {
          const apiErrors = {};
          Object.entries(response.errors).forEach(([key, value]) => {
            apiErrors[key.toLowerCase()] = Array.isArray(value) ? value[0] : value;
          });
          setErrors(apiErrors);
        }
      }
    } catch (error) {
      console.error('Kayıt sırasında hata:', error);
      toast.error('Qeydiyyat uğursuz oldu. Sonra yenidən cəhd edin.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setVerifyError('');
    setVerifyLoading(true);
    try {
      const response = await userService.verifyEmail({
        email: verifyEmail,
        code: verifyCode
      });
      if (response.isSucceeded) {
        toast.success('Email doğrulandı! Artıq daxil ola bilərsiniz.');
        navigate('/login');
      } else {
        setVerifyError(response.message || 'Kod doğrulanamadı.');
      }
    } catch (error) {
      setVerifyError('Kod doğrulanamadı. Sonra yenidən cəhd edin.');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendSuccess(false);
    try {
      const response = await userService.resendVerification({ email: verifyEmail });
      if (response.isSucceeded) {
        setResendSuccess(true);
        toast.success('Kod email adresinize tekrar gönderildi.');
      } else {
        toast.error(response.message || 'Kod tekrar gönderilemedi.');
      }
    } catch (error) {
      toast.error('Kod tekrar gönderilemedi. Sonra yenidən cəhd edin.');
    } finally {
      setResendLoading(false);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  return (
    <div className="container max-w-md mx-auto px-4 py-12">
      <div className="bg-white shadow-xl rounded-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <UserPlus className="h-6 w-6" /> Qeydiyyatdan Keç
          </h1>
          <p className="text-gray-500 mt-2">Yeni hesab yaradın</p>
        </div>
        {!showVerify ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Ad */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Adınız
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Adınız..."
                  className={`block w-full pl-10 pr-3 py-2 border ${errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'} rounded-lg bg-white focus:outline-none focus:ring-2 focus:border-transparent`}
                  required
                />
              </div>
              {errors.name && (
                <p className="text-red-600 text-xs mt-1">{errors.name}</p>
              )}
            </div>
            
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
                  placeholder="E-mailiniz..."
                  className={`block w-full pl-10 pr-3 py-2 border ${errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'} rounded-lg bg-white focus:outline-none focus:ring-2 focus:border-transparent`}
                  required
                />
              </div>
              {errors.email && (
                <p className="text-red-600 text-xs mt-1">{errors.email}</p>
              )}
            </div>
            
            {/* Telefon */}
            <div className="space-y-2">
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Telefon Nömrəsi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Telefon nömrəniz"
                  className={`block w-full pl-10 pr-3 py-2 border ${errors.phoneNumber ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'} rounded-lg bg-white focus:outline-none focus:ring-2 focus:border-transparent`}
                  required
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-red-600 text-xs mt-1">{errors.phoneNumber}</p>
              )}
            </div>
            
            {/* Şifre */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Şifrə
              </label>
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
                  className={`block w-full pl-10 pr-10 py-2 border ${errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'} rounded-lg bg-white focus:outline-none focus:ring-2 focus:border-transparent`}
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
              {errors.password && (
                <p className="text-red-600 text-xs mt-1">{errors.password}</p>
              )}
            </div>
            
            {/* Şifre Onay */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Şifrə Təkrarı
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Şifrənizin təkrarı"
                  className={`block w-full pl-10 pr-10 py-2 border ${errors.confirmPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'} rounded-lg bg-white focus:outline-none focus:ring-2 focus:border-transparent`}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={toggleConfirmPasswordVisibility}
                >
                  {showConfirmPassword ? 
                    <EyeOff className="h-5 w-5 text-gray-400" /> : 
                    <Eye className="h-5 w-5 text-gray-400" />
                  }
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-600 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full py-2 flex items-center justify-center gap-2"
            >
              {loading ? 'Qeydiyyat olunur...' : 'Qeydiyyatdan keç'}
              {!loading && <UserPlus className="h-5 w-5" />}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="verifyCode" className="block text-sm font-medium text-gray-700">
                Emailə gələn 6 rəqəmli kodu daxil edin
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="verifyCode"
                  name="verifyCode"
                  value={verifyCode}
                  onChange={e => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary text-center tracking-widest text-lg font-mono"
                  required
                  maxLength={6}
                  pattern="[0-9]{6}"
                  autoFocus
                />
              </div>
              {verifyError && <p className="text-red-600 text-xs mt-1">{verifyError}</p>}
              {resendSuccess && <p className="text-green-600 text-xs mt-1">Kod yenidən göndərildi!</p>}
            </div>
            <Button
              type="submit"
              disabled={verifyLoading || verifyCode.length !== 6}
              className="w-full py-2 flex items-center justify-center gap-2"
            >
              {verifyLoading ? 'Yoxlanılır...' : 'Kodu Doğrula'}
            </Button>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-600">Kod gəlmədimi?</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResend}
                disabled={resendLoading}
              >
                {resendLoading ? 'Göndərilir...' : 'Kodu Yenidən Göndər'}
              </Button>
            </div>
          </form>
        )}
        {!showVerify && (
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Artıq hesabınız var?
              <Link to="/login" className="text-primary ml-1.5 font-medium hover:underline">
                Giriş Edin
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register; 