import React from 'react';
import { MapPin, Users, Wallet, Calendar } from 'lucide-react';
import { format, parse } from 'date-fns';

const TripCard = ({ trip, onClick }) => {
  // Parse and format dates if they exist
  let formattedStartDate = null;
  let formattedEndDate = null;
  let startYear = null;
  let endYear = null;

  if (trip?.startDate) {
    const parsedStartDate = parse(trip.startDate, 'yyyy-MM-dd', new Date());
    formattedStartDate = format(parsedStartDate, 'd MMM'); // e.g., "20 Apr"
    startYear = format(parsedStartDate, 'yyyy'); // e.g., "2025"
  }

  if (trip?.endDate) {
    const parsedEndDate = parse(trip.endDate, 'yyyy-MM-dd', new Date());
    formattedEndDate = format(parsedEndDate, 'd MMM'); // e.g., "25 Apr"
    endYear = format(parsedEndDate, 'yyyy'); // e.g., "2025"
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer"
    onClick={() => onClick(trip.id)}>
      <img 
        src={trip.thumbnail} 
        alt={trip?.title || 'Trip'} 
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-semibold text-gray-800">{trip?.title || 'Untitled Trip'}</h3>
        <div className="mt-2 space-y-2">
          <div className="flex items-center text-gray-600 cursor-pointer">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{trip?.destination || 'No destination'}</span>
          </div>
          <div className="flex items-center text-gray-600 cursor-pointer">
            <Users className="h-4 w-4 mr-2" />
            <span>{trip?.people || 0} People</span>
          </div>
          <div className="flex items-center text-gray-600 cursor-pointer">
            <Wallet className="h-4 w-4 mr-2" />
            <span>{trip?.budget || 'No budget set'}</span>
          </div>
          <div className="flex items-center text-gray-600 cursor-pointer">
            <Calendar className="h-4 w-4 mr-2" />
            <span className="flex items-center space-x-1">
              {formattedStartDate && formattedEndDate && startYear && endYear ? (
                startYear === endYear ? (
                  <>
                    <span >{formattedStartDate}</span>
                    <span>-</span>
                    <span >{formattedEndDate}</span>
                    <span className="text-gray-500">, {startYear}</span>
                  </>
                ) : (
                  <>
                    <span >{formattedStartDate}</span>
                    <span className="text-gray-500">, {startYear}</span>
                    <span>-</span>
                    <span >{formattedEndDate}</span>
                    <span className="text-gray-500">, {endYear}</span>
                  </>
                )
              ) : (
                'Dates not set'
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripCard;