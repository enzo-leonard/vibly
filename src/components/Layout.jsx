import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import TopNavbar from './TopNavbar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <TopNavbar />
      <div className="flex-1 pb-24 pt-16">
        <Outlet />
      </div>
      <Navbar />
    </div>
  );
} 