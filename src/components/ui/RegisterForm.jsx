import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

const RegisterForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Şifre eşleşme durumunu kontrol et
    if (name === 'confirmPassword' || name === 'password') {
      if (name === 'confirmPassword') {
        setPasswordMatch(formData.password === value);
      } else if (name === 'password') {
        setPasswordMatch(formData.confirmPassword === '' || formData.confirmPassword === value);
      }
    }
  };

  async function onSubmit(event) {
    event.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setPasswordMatch(false);
      toast.error('Şifreler eşleşmiyor');
      return;
    }
    
    setIsLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phone, 
        password: formData.password
      });
      // Redirect işlemi AuthContext içinde yapılıyor
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Kayıt işleminde bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={onSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="name" className="text-sm font-medium">Ad Soyad</label>
            <input
              id="name"
              name="name"
              placeholder="Adınız Soyadınız"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoCapitalize="words"
              autoCorrect="off"
              disabled={isLoading}
              required
            />
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="phone" className="text-sm font-medium">Telefon Numarası</label>
            <input
              id="phone"
              name="phone"
              placeholder="+90 (555) 123-4567"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoCapitalize="none"
              autoCorrect="off"
              disabled={isLoading}
              required
            />
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="email" className="text-sm font-medium">E-posta</label>
            <input
              id="email"
              name="email"
              placeholder="name@example.com"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              required
            />
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="password" className="text-sm font-medium">Şifre</label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoCapitalize="none"
                autoCorrect="off"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <FaEyeSlash className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <FaEye className="h-4 w-4" aria-hidden="true" />
                )}
                <span className="sr-only">{showPassword ? "Şifreyi gizle" : "Şifreyi göster"}</span>
              </button>
            </div>
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">Şifre (Tekrar)</label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !passwordMatch ? "border-red-500" : "border-gray-300"
                }`}
                autoCapitalize="none"
                autoCorrect="off"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <FaEyeSlash className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <FaEye className="h-4 w-4" aria-hidden="true" />
                )}
                <span className="sr-only">{showConfirmPassword ? "Şifreyi gizle" : "Şifreyi göster"}</span>
              </button>
            </div>
            {!passwordMatch && <p className="text-sm text-red-500">Şifreler eşleşmiyor</p>}
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? "Hesap oluşturuluyor..." : "Kayıt Ol"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm; 