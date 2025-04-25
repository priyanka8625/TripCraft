import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Map, Briefcase, MessageSquareMore, Camera, LogOut } from 'lucide-react';
import Logo from './Logo';
import SidebarItem from './SidebarItem';
import { logout } from '../../../services/authService';

const sidebarItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: Map, label: 'Plan Itinerary', path: '/dashboard/plan' },
  { icon: Briefcase, label: 'Your Trips', path: '/dashboard/trips' },
  // { icon: MessageSquareMore, label: 'AI Assistant', path: '/dashboard/ai-assistant' },
  { icon: Camera, label: 'Snap Safari', path: '/dashboard/snap-safari' },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="w-72 bg-white shadow-lg rounded-r-2xl">
      <Logo />
      <nav className="mt-8 pr-3">
        {sidebarItems.map((item) => (
          <SidebarItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            to={item.path}
            isActive={
              item.path === '/dashboard'
                ? location.pathname === '/dashboard' // Only highlight Dashboard on root
                : location.pathname.startsWith(item.path)
            }
          />
        ))}
        <div className="mt-auto pt-8">
          <SidebarItem icon={LogOut} label="Logout" onClick={handleLogout} />
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
