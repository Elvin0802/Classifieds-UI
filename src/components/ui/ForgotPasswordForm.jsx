import React, { useState } from 'react';
import { FaCheck } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

const ForgotPasswordForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState('');
  const { resetPassword } = useAuth();

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);

    try {
      await resetPassword(email);
      setEmailSent(true);
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error(error.message || 'Şifre sıfırlama işleminde bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      {emailSent ? (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaCheck className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Şifre sıfırlama e-postası gönderildi! Daha fazla talimat için gelen kutunuzu kontrol edin.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">E-posta</label>
              <input
                id="email"
                placeholder="name@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ForgotPasswordForm; 