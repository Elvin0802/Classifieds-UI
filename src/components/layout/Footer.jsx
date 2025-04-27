import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white pt-10 pb-4">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div>
            <h2 className="text-xl font-bold mb-4">classifieds.app</h2>
            <p className="text-gray-300 mb-4">
              Universal platform for classified ads
            </p>
          </div>
          
          {/* Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Useful Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/ads" className="text-gray-300 hover:text-white">
                  Ads
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-gray-300 hover:text-white">
                  Help
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Legal and Terms */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-300 hover:text-white">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-300 hover:text-white">
                  Rules
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p className="text-gray-300 mb-2">info@classifieds.app</p>
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
          <p>&copy; {currentYear} classifieds.app. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 