import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, ExternalLink } from 'lucide-react';
import { cn } from '../ui/utils';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-white">classifieds.app</h2>
            <p className="text-gray-400 mb-4 text-sm">
              Universal platform for classified ads - find what you need or sell what you don't
            </p>
          </div>
          
          {/* Links */}
          <div>
            <h3 className="text-md font-semibold mb-4 text-white border-b border-gray-800 pb-2">Useful Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" /> Home
                </Link>
              </li>
              <li>
                <Link to="/ads" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" /> Ads
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" /> About Us
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" /> Help
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Legal and Terms */}
          <div>
            <h3 className="text-md font-semibold mb-4 text-white border-b border-gray-800 pb-2">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" /> Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" /> Terms of Service
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" /> Rules
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-md font-semibold mb-4 text-white border-b border-gray-800 pb-2">Contact</h3>
            <div className="text-sm space-y-2">
              <p className="text-gray-400 flex items-center gap-2">
                <Mail className="h-4 w-4" /> info@classifieds.app
              </p>
              <p className="text-gray-400 flex items-center gap-2 mb-4">
                <Phone className="h-4 w-4" /> +994 12 345 67 89
              </p>
              
              <div className="flex space-x-4">
                <a href="#" className="bg-gray-800 p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#" className="bg-gray-800 p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="bg-gray-800 p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="#" className="bg-gray-800 p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">&copy; {currentYear} classifieds.app. All rights reserved.</p>
            <div className="mt-4 md:mt-0">
              <p className="text-xs text-gray-600">Designed by classifieds team</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 