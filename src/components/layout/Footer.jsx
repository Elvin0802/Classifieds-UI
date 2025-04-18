import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white pt-10 pb-5">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Hakkımızda */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Hakkımızda</h3>
            <p className="text-gray-300 text-sm">
              İlanlar platformu, kullanıcılarımıza ürün ve hizmetlerini 
              paylaşma imkanı sunan güvenilir bir ilan sitesidir.
            </p>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Hızlı Linkler</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link to="/ilanlar" className="hover:text-primary transition-colors">
                  İlanlar
                </Link>
              </li>
              <li>
                <Link to="/kategoriler" className="hover:text-primary transition-colors">
                  Kategoriler
                </Link>
              </li>
              <li>
                <Link to="/ilan-ekle" className="hover:text-primary transition-colors">
                  İlan Ekle
                </Link>
              </li>
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <h3 className="text-lg font-semibold mb-4">İletişim</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>Email: info@ilanlar.com</li>
              <li>Telefon: +90 212 123 45 67</li>
              <li>Adres: İstanbul, Türkiye</li>
            </ul>
          </div>

          {/* Sosyal Medya */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Bizi Takip Edin</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                <FaLinkedin size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Telif Hakkı */}
        <div className="border-t border-gray-700 mt-8 pt-5">
          <p className="text-center text-sm text-gray-400">
            &copy; {currentYear} İlanlar. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 