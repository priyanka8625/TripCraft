import React from 'react';
import { MapPin, Briefcase } from 'lucide-react';

const UpcomingTrips = ({ trips = [] }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Upcoming Trips</h2>
      </div>
      <div className="space-y-4">
        {trips.map((trip, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
          >
            <h3 className="font-semibold text-gray-800">{trip?.name || 'Untitled Trip'}</h3>
            <div className="mt-2 space-y-2">
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{trip?.destination || 'No destination'}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Briefcase className="h-4 w-4 mr-2" />
                <span>{trip?.dates || 'No dates set'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingTrips;