import React, { useState } from 'react';
import { Home, Map, Briefcase, MessageSquareMore, Camera, LogOut } from 'lucide-react';
import Logo from './Logo';
import SidebarItem from './SidebarItem';
import { logout } from '../../../services/authService';

const sidebarItems = [
  { icon: Home, label: 'Dashboard', to: '/dashboard/dashboard' },
  { icon: Map, label: 'Plan Itinerary', to: '/dashboard/plan-itinerary' },
  { icon: Briefcase, label: 'Your Trips', to: '/dashboard/trips' },
  { icon: MessageSquareMore, label: 'AI Assistant', to: '/dashboard/assistant' },
  { icon: Camera, label: 'Snap Safari', to: '/dashboard/safari' },
];


const Sidebar = () => {
  const [activeItem, setActiveItem] = useState('Dashboard');

  const handleLogout = ()=>{
    logout();
  }
  return (
    <div className="w-72 bg-white shadow-lg rounded-r-2xl">
      <Logo />
      <nav className="mt-8 pr-3">
        {sidebarItems.map((item) => (
          <SidebarItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            to={item.to}
            isActive={activeItem === item.label}
            onClick={() => setActiveItem(item.label)}
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