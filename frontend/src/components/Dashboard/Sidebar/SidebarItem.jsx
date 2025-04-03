import React from 'react';
import clsx from 'clsx';

const SidebarItem = ({ icon: Icon, label = '', isActive = false, onClick }) => {
  return (
    <a
      href="#"
      className={clsx(
        'sidebar-item cursor-pointer px-4 py-2 flex items-center text-gray-700 hover:bg-gray-50',
        isActive && 'bg-emerald-50 text-emerald-600'
      )}
      onClick={onClick}
    >
      <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-emerald-600' : 'text-gray-600'}`} />
      {label}
    </a>
  );
};

export default SidebarItem;