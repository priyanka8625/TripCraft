import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ActivityCard from '../../../components/Dashboard/PlanItinerary/ActivityCard.jsx';
import MapComponent from '../../../components/Dashboard/PlanItinerary/MapComponent.jsx';
import LoadingScreen from '../../../components/Dashboard/PlanItinerary/LoadingScreen.jsx';
import { getItineraryWithTripId } from '../../../services/tripService.js';

export default function DisplayItinerary() {
  const [activeDay, setActiveDay] = useState(0);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [tripDays, setTripDays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();
  const { tripId } = location.state || {};
  const [focusedLocation, setFocusedLocation] = useState(null); // New state for focused location


  useEffect(() => {
    const fetchItinerary = async () => {
      if (!tripId) {
        setError('No trip ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await getItineraryWithTripId(tripId);
        const activities = data[0]?.activities;
        console.log(activities);

        // Add check for undefined or empty activities
        if (!activities || activities.length === 0) {
          setError('No activities found for this trip. Please add activities to your itinerary.');
          setIsLoading(false);
          return;
        }

        // Group activities by day
        const grouped = activities.reduce((acc, activity) => {
          const dayIndex = activity.day - 1;
          if (!acc[dayIndex]) {
            acc[dayIndex] = {
              date: activity.date || `Day ${activity.day}`,
              activities: [],
            };
          }
          acc[dayIndex].activities.push({
            day: activity.day,
            date: activity.date || `Day ${activity.day}`,
            name: activity.name,
            coordinates: {
              lat: activity.latitude,
              lng: activity.longitude,
            },
            location: activity.location,
            time_slot: activity.timeSlot,
            rating: activity.rating,
            category: activity.category,
            estimated_cost: activity.estimatedCost,
          });
          return acc;
        }, []);

        // Ensure all days are filled (handle missing days)
        const maxDay = Math.max(...activities.map(a => a.day));
        const filledDays = Array.from({ length: maxDay }, (_, i) => 
          grouped[i] || {
            date: `Day ${i + 1}`,
            activities: [],
          }
        );

        setTripDays(filledDays);
      } catch (err) {
        setError(err.message || 'Error fetching itinerary');
      } finally {
        setIsLoading(false);
      }
    };

    fetchItinerary();
  }, [tripId]);

  const toggleEvent = (index) => {
    setExpandedEvent(expandedEvent === index ? null : index);
  };

  const currentActivities = tripDays.length > 0 ? tripDays[activeDay]?.activities || [] : [];
  const mappedLocations = currentActivities.map((activity) => ({
    name: activity.name,
    coordinates: [activity.coordinates.lat, activity.coordinates.lng],
    rating: activity.rating
  }));

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  if (tripDays.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">No Itinerary Found</h2>
          <p className="text-gray-600">Please create a trip to view its itinerary.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 flex-1 flex flex-col h-full overflow-hidden">
        {/* Day Tabs */}
        <div className="flex flex-wrap gap-4 py-4 z-10 sticky top-0">
          {tripDays.map((day, index) => (
            <button
              key={index}
              onClick={() => setActiveDay(index)}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 transform ${
                activeDay === index
                  ? 'bg-emerald-600 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:shadow-md hover:scale-102'
              }`}
            >
              {day.date}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8 flex-1 w-full overflow-hidden">
          {/* Activities */}
          <div
            className="lg:w-2/3 w-full overflow-y-auto"
            style={{ maxHeight: '550px' }}
          >
            <div className="relative pl-12">
              <div className="absolute left-[12px] top-0 w-[2px] bg-emerald-600 h-full"></div>
              <div className="space-y-6">
                {currentActivities.map((event, index) => (
                  <ActivityCard
                    key={index}
                    event={event}
                    index={index}
                    isExpanded={expandedEvent === index}
                    toggleEvent={toggleEvent}
                    isLast={index === currentActivities.length - 1}
                    isFirst={index === 0}
                    onClick={() => setFocusedLocation([event.coordinates.lat, event.coordinates.lng])}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="lg:w-1/3 w-full">
            <div
              className="bg-white rounded-xl shadow-lg p-4"
              style={{ height: '500px' }}
            >
              <MapComponent locations={mappedLocations} focusedLocation={focusedLocation} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}