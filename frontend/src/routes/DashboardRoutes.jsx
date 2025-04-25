import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard/Dashboard';
import DashboardLayout from '../layouts/DashboardLayout';
import DisplayItinerary from '../pages/Dashboard/PlanItinerary/DisplayItinerary';
import CreateTripForm from '../pages/Dashboard/PlanItinerary/CreateTripForm';
import PlanMethodSelection from '../pages/Dashboard/PlanItinerary/PlanMethodSelection';
import GenItineraryJSX from '../GenItineraryJSX/PlanFromScratch';
// import AIChatBot from "../components/AiChatBot/AIChatBot";
import Trips from '../pages/Dashboard/Trips';
import SnapSafariRoutes from './SnapSafariRoutes';
import PlanFromScratch from '../GenItineraryJSX/PlanFromScratch';
function DashboardRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="plan" element={<PlanMethodSelection />} />
        <Route path="plan/:method" element={<CreateTripForm />} />
        {/* <Route path="plan/manual" element={<CreateTripForm />} /> */}
        <Route path="itinerary" element={<DisplayItinerary />} />
        <Route path="trips" element={<Trips />} />
        <Route path="plan/manual/generate" element={<PlanFromScratch />} />
{/*         <Route path='ai-assistant' element={<AIChatBot />} /> */}
        <Route path='snap-safari/*' element={<SnapSafariRoutes/>} />
        {/* <Route path='snap-safari/profile' element={<Profile />} /> */}
        
      </Route>
    </Routes>
  );
}

export default DashboardRoutes;
