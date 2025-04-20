import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white pt-10 pb-4">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo ve Hakkında */}
          <div>
            <h2 className="text-xl font-bold mb-4">elan.az</h2>
            <p className="text-gray-300 mb-4">
              Azərbaycanda özəl elanlar üçün universal meydança
            </p>
          </div>
          
          {/* Linkler */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Faydalı Linklər</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white">
                  Ana Səhifə
                </Link>
              </li>
              <li>
                <Link to="/ads" className="text-gray-300 hover:text-white">
                  Elanlar
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white">
                  Haqqımızda
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-gray-300 hover:text-white">
                  Kömək
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Yasal ve Koşullar */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Hüquqi</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-white">
                  Məxfilik Siyasəti
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-300 hover:text-white">
                  İstifadəçi Razılaşması
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-300 hover:text-white">
                  Qaydalar
                </Link>
              </li>
            </ul>
          </div>
          
          {/* İletişim */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Əlaqə</h3>
            <p className="text-gray-300 mb-2">info@elan.az</p>
            <p className="text-gray-300 mb-4">+994 12 345 67 89</p>
            
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white text-xl">
                <FaFacebook />
              </a>
              <a href="#" className="text-gray-300 hover:text-white text-xl">
                <FaTwitter />
              </a>
              <a href="#" className="text-gray-300 hover:text-white text-xl">
                <FaInstagram />
              </a>
              <a href="#" className="text-gray-300 hover:text-white text-xl">
                <FaLinkedin />
              </a>
            </div>
          </div>
        </div>
        
        <hr className="border-gray-700 my-8" />
        
        <div className="text-center text-gray-400">
          <p>&copy; {currentYear} elan.az. Bütün hüquqlar qorunur.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 