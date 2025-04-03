import React from 'react';
import { MapPin, Users, Wallet } from 'lucide-react';

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
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
          >
            <img 
              src={trip?.image} 
              alt={trip?.name || 'Trip'} 
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-gray-800">{trip?.name || 'Untitled Trip'}</h3>
              <div className="mt-2 space-y-2">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{trip?.destination || 'No destination'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{trip?.people || 0} People</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Wallet className="h-4 w-4 mr-2" />
                  <span>{trip?.budget || 'No budget set'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentTrips;