import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Feed from '../pages/Dashboard/SnapSafari/Feed';
import Profile from '../pages/Dashboard/SnapSafari/Profile';

function SnapSafariRoutes() {
    return (
      <Routes>
         {/* Render Feed for all routes under /dashboard/snap-safari/* */}
        <Route path="/*" element={<Feed />} />
      </Routes>
    );
  }

export default SnapSafariRoutes;