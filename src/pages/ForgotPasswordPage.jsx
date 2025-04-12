import React from 'react';
import { Link } from 'react-router-dom';
import ForgotPasswordForm from '../components/ui/ForgotPasswordForm';

const ForgotPasswordPage = () => {
  return (
    <div className="w-full my-4">
      <div className="flex flex-col space-y-6 bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Şifremi Unuttum</h1>
          <p className="text-sm text-gray-500">
            E-posta adresinizi girin, şifrenizi sıfırlamanız için bir bağlantı göndereceğiz
          </p>
        </div>
        <ForgotPasswordForm />
        <p className="text-center text-sm text-gray-500">
          <Link to="/login" className="text-blue-600 underline underline-offset-4 hover:text-blue-800">
            Giriş sayfasına dön
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPasswordPage; 