// UI component: renders and manages the Footer feature block.
import React from 'react';
import { Link } from 'react-router-dom';
import { APP_NAME } from '../../utils/constants';
import mainLogo from '../../assets/main_logo.png';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white py-12 mt-auto relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src={mainLogo} alt={APP_NAME} className="h-10 w-10 opacity-80" />
              <h3 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-yellow-400 bg-clip-text text-transparent">
                {APP_NAME}
              </h3>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Connecting skilled workers with those who need them. Find plumbers, electricians, carpenters, and more in seconds.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-green-400 transition-colors duration-300">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-green-400 transition-colors duration-300">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-400 hover:text-green-400 transition-colors duration-300">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="tel:+911800-123-4567" className="text-gray-400 hover:text-green-400 transition-colors duration-300">
                  +91 1800-123-4567
                </a>
              </li>
              <li>
                <a href="mailto:support@udhyogapay.com" className="text-gray-400 hover:text-green-400 transition-colors duration-300">
                  support@udhyogapay.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm text-center md:text-left">
              © 2026 {APP_NAME}. All rights reserved. Made with ❤️ in India
            </p>
            <div className="flex gap-4 text-sm">
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors duration-300">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors duration-300">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
