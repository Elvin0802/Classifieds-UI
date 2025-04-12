import React from 'react';
import { Link } from 'react-router-dom';
import RegisterForm from '../components/ui/RegisterForm';

const RegisterPage = () => {
  return (
    <div className="w-full my-4">
      <div className="flex flex-col space-y-6 bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Hesap Oluştur</h1>
          <p className="text-sm text-gray-500">Hesap oluşturmak için bilgilerinizi girin</p>
        </div>
        <RegisterForm />
        <p className="text-center text-sm text-gray-500">
          Zaten hesabınız var mı?{" "}
          <Link to="/login" className="text-blue-600 underline underline-offset-4 hover:text-blue-800">
            Giriş yap
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage; 