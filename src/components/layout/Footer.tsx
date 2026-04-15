import { Globe, Facebook, Twitter, Instagram, Linkedin, Mail, Phone } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Mpingi<span className="text-blue-400">Market</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              A free online classifieds platform connecting buyers and sellers from over 239 countries worldwide.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-sky-500 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Categories</h3>
            <ul className="space-y-2 text-sm">
              {['Vehicles', 'Electronics', 'Fashion', 'Real Estate', 'Jobs', 'Services'].map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => onNavigate('listings')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => onNavigate('home')} className="text-gray-400 hover:text-white transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('listings')} className="text-gray-400 hover:text-white transition-colors">
                  Browse Ads
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('post-listing')} className="text-gray-400 hover:text-white transition-colors">
                  Post an Ad
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('auth')} className="text-gray-400 hover:text-white transition-colors">
                  Sign In / Register
                </button>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Help & Support</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span className="text-gray-400">support@mpingimarket.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span className="text-gray-400">+1 (555) 000-0000</span>
              </li>
              <li className="flex items-start gap-2">
                <Globe className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400">www.mpingimarket.com</span>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-400">Coverage</p>
              <div className="mt-1 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-white font-bold text-sm">239</p>
                  <p className="text-gray-500 text-xs">Countries</p>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">4,120</p>
                  <p className="text-gray-500 text-xs">Regions</p>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">47K+</p>
                  <p className="text-gray-500 text-xs">Cities</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Mpingi Market. All rights reserved. Developed by Nzuzi Mpingi Doudou.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
