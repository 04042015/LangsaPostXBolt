import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, MessageCircle } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 dark:bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-coral-500 mb-4">LangsaPost</h3>
            <p className="text-gray-300 mb-4">
              Portal berita terpercaya untuk informasi terkini Langsa dan sekitarnya. 
              Menyajikan berita aktual, objektif, dan dapat dipertanggungjawabkan.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-coral-400 transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={24} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-coral-400 transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={24} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-coral-400 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={24} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-coral-400 transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle size={24} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Tautan Cepat</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link to="/tentang" className="text-gray-300 hover:text-white transition-colors">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link to="/kontak" className="text-gray-300 hover:text-white transition-colors">
                  Kontak
                </Link>
              </li>
              <li>
                <Link to="/karir" className="text-gray-300 hover:text-white transition-colors">
                  Karir
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/kebijakan-privasi" className="text-gray-300 hover:text-white transition-colors">
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link to="/syarat-ketentuan" className="text-gray-300 hover:text-white transition-colors">
                  Syarat & Ketentuan
                </Link>
              </li>
              <li>
                <Link to="/pedoman-komunitas" className="text-gray-300 hover:text-white transition-colors">
                  Pedoman Komunitas
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} LangsaPost. Hak cipta dilindungi undang-undang.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <p className="text-gray-400 text-sm">
                Email: info@langsapost.com | Telp: +62 812-3456-7890
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;