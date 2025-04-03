import React, { useState } from 'react';
import { Home, Map, Briefcase, MessageSquareMore, Camera, LogOut } from 'lucide-react';
import Logo from './Logo';
import SidebarItem from './SidebarItem';

const sidebarItems = [
  { icon: Home, label: 'Dashboard' },
  { icon: Map, label: 'Plan Itinerary' },
  { icon: Briefcase, label: 'Your Trips' },
  { icon: MessageSquareMore, label: 'AI Assistant' },
  { icon: Camera, label: 'Snap Safari' },
];

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState('Dashboard');

  return (
    <div className="w-72 bg-white shadow-lg rounded-r-2xl">
      <Logo />
      <nav className="mt-8 pr-3">
        {sidebarItems.map((item) => (
          <SidebarItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            isActive={activeItem === item.label}
            onClick={() => setActiveItem(item.label)}
          />
        ))}
        <div className="mt-auto pt-8">
          <SidebarItem icon={LogOut} label="Logout" />
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;