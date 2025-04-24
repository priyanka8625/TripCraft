import React from 'react';
import TripCard from './Trips/TripCard';

const RecentTrips = ({ trips = [] }) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Recent Trips</h2>
        <a href="#" className="text-emerald-600 hover:text-emerald-700 cursor-pointer">
          View All
        </a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {trips.map((trip, index) => (
          <TripCard key={index} trip={trip} />
        ))}
      </div>
    </div>
  );
};

export default RecentTrips;