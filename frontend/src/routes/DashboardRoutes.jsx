import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard/Dashboard';

function DashboardRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} /> {/* /dashboard */}
    </Routes>
  );
}

export default DashboardRoutes;
