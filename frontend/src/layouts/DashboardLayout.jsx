// DashboardLayout.jsx
import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Dashboard/Sidebar/Sidebar.jsx';
import Navbar from '../components/Dashboard/Navbar/Navbar.jsx';
import { getUserProfile } from '../services/userService.js';




const DashboardLayout =  () => {
  // Initialize user state as null or an empty object
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch user profile
      const userData = await getUserProfile();
      setUser({
        name: userData?.name || 'Unknown User',
        // name: 'Priyanka',
        role: 'Traveler',
        avatar: './img/profile_pic.jpg' // Fallback avatar
      });
    }
    fetchData();
  }, []); // Empty dependency array means this runs once on mount

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
