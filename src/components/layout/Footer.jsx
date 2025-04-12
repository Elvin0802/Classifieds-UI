import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Hakkımızda</h3>
            <p className="text-gray-300">
              İlanlar platformu, alıcı ve satıcıları bir araya getiren güvenilir bir pazaryeridir.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Hızlı Linkler</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/ads" className="text-gray-300 hover:text-white">
                  Tüm İlanlar
                </Link>
              </li>
              <li>
                <Link to="/create-ad" className="text-gray-300 hover:text-white">
                  İlan Ekle
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-300 hover:text-white">
                  Profilim
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">İletişim</h3>
            <ul className="space-y-2 text-gray-300">
              <li>Email: info@ilanlar.com</li>
              <li>Telefon: +90 (555) 123 45 67</li>
              <li>Adres: İstanbul, Türkiye</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-300">
          <p>&copy; {new Date().getFullYear()} İlanlar. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 