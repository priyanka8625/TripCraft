import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard/Dashboard';
import PlanItinerary from '../pages/Dashboard/PlanItinerary';
import DashboardLayout from '../layouts/DashboardLayout';
import DisplayItinerary from '../pages/Dashboard/DisplayItinerary';
import CreateTripForm from '../components/Dashboard/PlanItinerary/CreateTripForm';

function DashboardRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="create-trip" element={<CreateTripForm />} />
        <Route path="itinerary" element={<DisplayItinerary />} />
      </Route>
    </Routes>
  );
}

export default DashboardRoutes;
