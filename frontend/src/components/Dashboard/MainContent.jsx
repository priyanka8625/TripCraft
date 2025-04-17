import React from 'react';
import RecentTrips from './RecentTrips';
import Activities from './Activities';
import UpcomingTrips from './UpcomingTrips';

const MainContent = ({ user = {}, recentTrips = [], activities = [], upcomingTrips = [] }) => {
  return (
    <div className="p-8 ">
      <div className="mb-8 ">
        <h1 className="text-2xl font-bold text-gray-800">
          Hello {user?.name || 'Traveler'}!
        </h1>
        <p className="text-gray-600">
          Welcome back and explore the world.
        </p>
      </div>

      <RecentTrips trips={recentTrips} />

      <div className="grid grid-cols-3 gap-8">
        <Activities activities={activities} />
        <UpcomingTrips trips={upcomingTrips} />
      </div>
    </div>
  );
};

export default MainContent;