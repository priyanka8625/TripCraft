// DashboardLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Dashboard/Sidebar/Sidebar.jsx';
import Navbar from '../components/Dashboard/Navbar/Navbar.jsx';

const user = {
  name: "Anni",
  role: "Traveler Pro",
  avatar: "./img/profile_pic.jpg"
};

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Navbar user={user} />
        <div className="p-4 ">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
