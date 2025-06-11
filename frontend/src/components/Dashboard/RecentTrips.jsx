import React from 'react';
import TripCard from './Trips/TripCard';

const RecentTrips = ({ trips = [] }) => {
  // Check if trips is undefined, null, or empty
  const hasTrips = trips && Array.isArray(trips) && trips.length > 0;

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Recent Trips</h2>
        <a href="#" className="text-emerald-600 hover:text-emerald-700 cursor-pointer">
          View All
        </a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {hasTrips ? (
          trips.slice(0, 4).map((trip, index) => (
            <TripCard key={index} trip={trip} />
          ))
        ) : (
          <div className="text-center text-gray-600 py-6">
            No recent trips available
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentTrips;