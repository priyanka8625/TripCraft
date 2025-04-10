import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard/Dashboard';
import PlanItinerary from '../pages/Dashboard/PlanItinerary';
import DashboardLayout from '../layouts/DashboardLayout';

function DashboardRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="plan-itinerary" element={<PlanItinerary />} />
      </Route>
    </Routes>
  );
}

export default DashboardRoutes;
