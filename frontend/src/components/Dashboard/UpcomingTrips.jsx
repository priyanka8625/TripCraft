import React from 'react';
import { MapPin, Calendar } from 'lucide-react';
import { parse, format } from 'date-fns';

const UpcomingTrips = ({ trips = [] }) => {
  // Check if trips is undefined, null, or empty
  const hasTrips = trips && Array.isArray(trips) && trips.length > 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Upcoming Trips</h2>
        <a href="#" className="text-emerald-600 hover:text-emerald-700 cursor-pointer">
          View All
        </a>
      </div>
      <div className="space-y-4">
        {hasTrips ? (
          trips.slice(0, 4).map((trip, index) => {
            // Parse and format dates for each trip
            let formattedStartDate = null;
            let formattedEndDate = null;
            let startYear = null;
            let endYear = null;

            if (trip?.startDate) {
              try {
                const parsedStartDate = parse(trip.startDate, 'yyyy-MM-dd', new Date());
                formattedStartDate = format(parsedStartDate, 'd MMM'); // e.g., "20 Apr"
                startYear = format(parsedStartDate, 'yyyy'); // e.g., "2025"
              } catch (error) {
                console.error(`Error parsing start date for trip ${trip.title}:`, error);
              }
            }

            if (trip?.endDate) {
              try {
                const parsedEndDate = parse(trip.endDate, 'yyyy-MM-dd', new Date());
                formattedEndDate = format(parsedEndDate, 'd MMM'); // e.g., "25 Apr"
                endYear = format(parsedEndDate, 'yyyy'); // e.g., "2025"
              } catch (error) {
                console.error(`Error parsing end date for trip ${trip.title}:`, error);
              }
            }

            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
              >
                <h3 className="font-semibold text-gray-800">{trip?.title || 'Untitled Trip'}</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center text-gray-600 cursor-pointer">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{trip?.destination || 'No destination'}</span>
                  </div>
                  <div className="flex items-center text-gray-600 cursor-pointer">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="flex items-center space-x-1">
                      {formattedStartDate && formattedEndDate && startYear && endYear ? (
                        startYear === endYear ? (
                          <>
                            <span>{formattedStartDate}</span>
                            <span>-</span>
                            <span>{formattedEndDate}</span>
                            <span className="text-gray-500">, {startYear}</span>
                          </>
                        ) : (
                          <>
                            <span>{formattedStartDate}</span>
                            <span className="text-gray-500">, {startYear}</span>
                            <span>-</span>
                            <span>{formattedEndDate}</span>
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
            );
          })
        ) : (
          <div className="text-center text-gray-600 py-6">
            No upcoming trips available
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingTrips;