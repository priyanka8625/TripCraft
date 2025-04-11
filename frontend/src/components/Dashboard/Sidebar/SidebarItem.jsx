import React from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

const SidebarItem = ({ icon: Icon, label = '', isActive = false, to, onClick }) => {
  const baseClass = clsx(
    'flex items-center space-x-3 p-3 rounded-lg cursor-pointer',
    isActive ? 'bg-emerald-50 text-emerald-600' : 'text-gray-600 hover:bg-gray-50'
  );

  const content = (
    <div className={baseClass}>
      <Icon className="h-5 w-5" />
      <span className="font-medium">{label}</span>
    </div>
  );

  return to ? (
    <Link to={to} onClick={onClick}>
      {content}
    </Link>
  ) : (
    <div onClick={onClick}>
      {content}
    </div>
  );
};

export default SidebarItem;
