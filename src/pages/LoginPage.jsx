import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../components/ui/LoginForm';

const LoginPage = () => {
  return (
    <div className="w-full my-4">
      <div className="flex flex-col space-y-6 bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Tekrar Hoş Geldiniz</h1>
          <p className="text-sm text-gray-500">Hesabınıza giriş yapmak için bilgilerinizi girin</p>
        </div>
        <LoginForm />
        <p className="text-center text-sm text-gray-500">
          Hesabınız yok mu?{" "}
          <Link to="/register" className="text-blue-600 underline underline-offset-4 hover:text-blue-800">
            Kayıt ol
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage; 