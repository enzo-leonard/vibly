import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaUser, FaUsers, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

export default function TopNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
  };

  // Only show navbar when user is authenticated
  if (!user) return null;

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-white shadow-lg z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <Logo size="normal" className="transition-transform hover:scale-105" />
            </Link>

            {/* Hamburger Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <FaTimes size={24} className="text-purple-600" />
              ) : (
                <FaBars size={24} className="text-purple-600" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsMenuOpen(false)} />
      )}

      {/* Mobile Menu */}
      <div 
        className={`fixed top-16 right-0 w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="py-2">
          <ul className="space-y-1">
            <li>
              <Link 
                to="/create" 
                className="flex items-center space-x-3 px-4 py-3 hover:bg-purple-50 text-gray-700 hover:text-purple-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <FaUsers className="text-purple-600" />
                <span className="font-medium">Créer une association</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/profile" 
                className="flex items-center space-x-3 px-4 py-3 hover:bg-purple-50 text-gray-700 hover:text-purple-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <FaUser className="text-purple-600" />
                <span className="font-medium">Voir mon profil</span>
              </Link>
            </li>
            <li className="border-t border-gray-200 mt-2 pt-2">
              <button 
                onClick={() => {
                  handleSignOut();
                  setIsMenuOpen(false);
                }}
                className="flex items-center space-x-3 px-4 py-3 hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors w-full"
              >
                <FaSignOutAlt />
                <span className="font-medium">Déconnexion</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
} 