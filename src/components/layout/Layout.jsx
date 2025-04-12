import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  const location = useLocation();
  
  // Kimlik doğrulama sayfaları için kontrol
  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className={`flex-grow ${isAuthPage ? 'flex items-center justify-center py-12' : 'container mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
        <div className={`w-full ${isAuthPage ? 'max-w-md px-4 my-8' : ''}`}>
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout; 