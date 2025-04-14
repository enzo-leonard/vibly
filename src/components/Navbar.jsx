import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaUser, FaComments, FaCalendarAlt, FaPlus } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import homeIcon from '../assets/home.png';
import couponIcon from '../assets/coupon.png';
import logoPlus from '../assets/logo_plus.png';
import calendarIcon from '../assets/calendar.png';
import messageIcon from '../assets/message.png';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
  };

  // Only show navbar when user is authenticated
  if (!user) return null;

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white shadow-lg z-50 border-t border-gray-200">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center py-2">
          <Link 
            to="/feed" 
            className={`flex flex-col items-center ${location.pathname === '/' || location.pathname === '/feed' ? 'text-purple-600' : 'text-gray-500'} transition-colors`}
          >
            <div className="w-10 h-10 flex items-center justify-center">
              <img 
                src={homeIcon} 
                alt="Accueil" 
                className={`w-8 h-8 transition-all duration-300 ${location.pathname === '/' || location.pathname === '/feed' ? 'rotate-12 filter hue-rotate-90' : ''}`} 
              />
            </div>
          </Link>
          
          <Link 
            to="/offers" 
            className={`flex flex-col items-center ${location.pathname === '/offers' ? 'text-purple-600' : 'text-gray-500'} transition-colors`}
          >
            <div className="w-10 h-10 flex items-center justify-center">
              <img 
                src={couponIcon} 
                alt="Offres" 
                className={`w-8 h-8 transition-all duration-300 ${location.pathname === '/offers' ? 'rotate-12 filter hue-rotate-90' : ''}`} 
              />
            </div>
          </Link>
          
          <div className="flex items-center justify-center -mt-12">
            <Link
              to="/create"
              className="flex items-center justify-center text-white"
            >
             <img src={logoPlus} alt="Créer" className="w-14 h-14" />
            </Link>
          </div>
          
          <Link 
            to="/event" 
            className={`flex flex-col items-center ${location.pathname === '/event' ? 'text-purple-600' : 'text-gray-500'} transition-colors`}
          >
            <div className="w-10 h-10 flex items-center justify-center">
              <img 
                src={calendarIcon} 
                alt="Événements" 
                className={`w-8 h-8 transition-all duration-300 ${location.pathname === '/event' ? 'rotate-12 filter hue-rotate-90' : ''}`} 
              />
            </div>
          </Link>
          
          <Link 
            to="/chat" 
            className={`flex flex-col items-center ${location.pathname === '/chat' ? 'text-purple-600' : 'text-gray-500'} transition-colors`}
          >
            <div className="w-10 h-10 flex items-center justify-center">
              <img 
                src={messageIcon} 
                alt="Chat" 
                className={`w-8 h-8 transition-all duration-300 ${location.pathname === '/chat' ? 'rotate-12 filter hue-rotate-90' : ''}`} 
              />
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
} 