import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard/Dashboard';
import DashboardLayout from '../layouts/DashboardLayout';
import DisplayItinerary from '../pages/Dashboard/PlanItinerary/DisplayItinerary';
import CreateTripForm from '../pages/Dashboard/PlanItinerary/CreateTripForm';
import PlanMethodSelection from '../pages/Dashboard/PlanItinerary/PlanMethodSelection';
import PlanFromScratch from '../GenItineraryJSX/PlanFromScratch';
import Trips from '../pages/Dashboard/Trips';
import SnapSafariRoutes from './SnapSafariRoutes';
import Chatbot from '../pages/Dashboard/Chatbot';

function DashboardRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="plan" element={<PlanMethodSelection />} />
        <Route path="plan/:method" element={<CreateTripForm />} />
        <Route path="itinerary" element={<DisplayItinerary />} />
        <Route path="trips" element={<Trips />} />
        {/* Updated route to handle both generate and edit modes */}
        <Route path="plan/manual/:mode" element={<PlanFromScratch />} />
        <Route path='snap-safari/*' element={<SnapSafariRoutes/>} />
        <Route path='ai-assistant' element={<Chatbot />} />
      </Route>
    </Routes>
  );
}

export default DashboardRoutes;