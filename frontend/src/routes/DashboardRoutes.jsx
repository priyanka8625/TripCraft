import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard/Dashboard';
import DashboardLayout from '../layouts/DashboardLayout';
import DisplayItinerary from '../pages/Dashboard/DisplayItinerary';
import CreateTripForm from '../pages/Dashboard/PlanItinerary/CreateTripForm';
import PlanMethodSelection from '../pages/Dashboard/PlanItinerary/PlanMethodSelection';

function DashboardRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="plan" element={<PlanMethodSelection />} />
        <Route path="plan/ai" element={<CreateTripForm />} />
        <Route path="plan/manual" element={<CreateTripForm />} />
        <Route path="itinerary" element={<DisplayItinerary />} />
      </Route>
    </Routes>
  );
}

export default DashboardRoutes;
