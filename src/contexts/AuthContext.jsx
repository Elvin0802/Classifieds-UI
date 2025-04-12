import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService, { ROLES } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const checkAuthStatus = useCallback(async () => {
    try {
      if (authService.isAuthenticated()) {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      if (error.response?.status === 401) {
        await authService.logout();
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (email, password) => {
    try {
      await authService.login(email, password);
      const userData = await authService.getCurrentUser();
      setUser(userData);
      toast.success('Başarıyla giriş yapıldı!');
      
      // Admin kullanıcı ise admin sayfasına yönlendir
      if (userData.role === ROLES.ADMIN) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      toast.error(error.message || 'Giriş yapılırken bir hata oluştu');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      toast.success('Başarıyla çıkış yapıldı!');
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'Çıkış yapılırken bir hata oluştu');
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      await authService.register(userData);
      toast.success('Kayıt başarılı! Lütfen giriş yapın.');
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'Kayıt olurken bir hata oluştu');
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      await authService.resetPassword(email);
      toast.success('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
    } catch (error) {
      toast.error(error.message || 'Şifre sıfırlama işlemi başarısız oldu');
      throw error;
    }
  };

  const confirmResetToken = async (token, newPassword) => {
    try {
      await authService.confirmResetToken(token, newPassword);
      toast.success('Şifreniz başarıyla güncellendi! Lütfen yeni şifrenizle giriş yapın.');
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'Şifre güncelleme işlemi başarısız oldu');
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    resetPassword,
    confirmResetToken,
    isAuthenticated: authService.isAuthenticated,
    isAdmin: authService.isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 