import React, { useState } from 'react';
import { Bell } from 'lucide-react';

const UserMenu = ({ user = {} }) => {
  const [showNotification, setShowNotification] = useState(false);

  return (
    <div className="flex items-center space-x-4">
      <button 
        className="p-2 hover:bg-gray-100 rounded-full relative cursor-pointer"
        onClick={() => setShowNotification(!showNotification)}
      >
        <Bell className="h-5 w-5 text-gray-600" />
        {showNotification && (
          <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Notifications</h3>
            <p className="text-gray-600 text-sm">No new notifications</p>
          </div>
        )}
      </button>
      <div className="flex items-center space-x-2 cursor-pointer">
        <img
          src='/img/profile_pic.jpg'
          alt={user?.name || 'User'}
          className="h-10 w-10 rounded-lg "
        />
        <span className="font-medium text-gray-700">{user?.name || 'User'}</span>
      </div>
    </div>
  );
};

export default UserMenu;