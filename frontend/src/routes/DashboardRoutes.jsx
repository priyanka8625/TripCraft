import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard/Dashboard';
import PlanItinerary from '../pages/Dashboard/PlanItinerary';

function DashboardRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} /> 
      <Route path="/plan-itinerary" element={<PlanItinerary />} /> 
    </Routes>
  );
}

export default DashboardRoutes;
