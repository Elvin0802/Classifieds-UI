import { Link } from 'react-router-dom';
import { FaHome, FaSearch, FaArrowLeft } from 'react-icons/fa';
import React from 'react';

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-4xl px-4 py-8">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Sol taraf - İllüstrasyon */}
            <div className="bg-primary md:w-1/2 p-8 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-9xl font-bold text-white">404</h1>
                <div className="w-16 h-1 bg-white mx-auto my-4"></div>
                <p className="text-white text-xl">Sayfa bulunamadı</p>
              </div>
            </div>
            
            {/* Sağ taraf - İçerik */}
            <div className="md:w-1/2 p-8">
              <div className="max-w-md mx-auto">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Ups! Bir şeyler yanlış gitti.</h2>
                
                <p className="text-gray-600 mb-8">
                  Aradığınız sayfa mevcut değil veya başka bir hata oluştu. Aşağıdaki seçenekleri deneyebilirsiniz:
                </p>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-600 text-sm">1</span>
                    </div>
                    <p className="ml-3 text-gray-600">
                      Ana sayfaya dönün ve baştan başlayın
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-600 text-sm">2</span>
                    </div>
                    <p className="ml-3 text-gray-600">
                      İlanlar bölümünü ziyaret edin
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-600 text-sm">3</span>
                    </div>
                    <p className="ml-3 text-gray-600">
                      Önceki sayfaya geri dönün
                    </p>
                  </li>
                </ul>
                
                <div className="space-y-3">
                  <Link to="/" className="btn btn-primary w-full flex items-center justify-center">
                    <FaHome className="mr-2" /> Ana Sayfaya Dön
                  </Link>
                  <Link to="/ilanlar" className="btn btn-outline btn-primary w-full flex items-center justify-center">
                    <FaSearch className="mr-2" /> İlanları Keşfet
                  </Link>
                  <button 
                    onClick={() => window.history.back()} 
                    className="btn btn-ghost w-full flex items-center justify-center"
                  >
                    <FaArrowLeft className="mr-2" /> Geri Dön
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound; 