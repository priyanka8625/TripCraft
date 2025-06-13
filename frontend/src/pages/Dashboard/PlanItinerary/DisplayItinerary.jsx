import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ActivityCard from '../../../components/Dashboard/PlanItinerary/ActivityCard.jsx';
import TravelCard from '../../../components/Dashboard/PlanItinerary/TravelCard.jsx';
import RestaurantCard from '../../../components/Dashboard/PlanItinerary/RestaurantCard.jsx';
import HotelCard from '../../../components/Dashboard/PlanItinerary/HotelCard.jsx';
import MapComponent from '../../../components/Dashboard/PlanItinerary/MapComponent.jsx';
import LoadingScreen from '../../../components/Dashboard/PlanItinerary/LoadingScreen.jsx';
import { getItineraryWithTripId } from '../../../services/tripService.js'; // Adjust the path to your service file

export default function DisplayItinerary() {
  const [activeDay, setActiveDay] = useState(0);
  const [expandedSections, setExpandedSections] = useState({
    activities: true,
    restaurants: false,
    hotels: false,
  });
  const [tripDays, setTripDays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { tripId } = location.state || {};
  const [focusedLocation, setFocusedLocation] = useState(null);
  const itineraryData = {
    itinerary: [
    {
      day: 1,
      date: "2025-04-25",
      activities: [
        { name: "Agrasen ki Baoli", category: "Offbeat", location: "Connaught Place", time_slot: "09:00-11:00", duration: 2.0, durationUnit: "hours", estimatedCost: 0, rating: 4.0, latitude: 28.6284, longitude: 77.2215 },
        { name: "Travel to Raj Ghat", category: "Travel", distance: 5, distanceUnit: "km", duration: 7, durationUnit: "minutes", estimatedCost: 160, time_slot: "19:00-19:06", latitude: 28.6366, longitude: 77.2475 },
        { name: "Raj Ghat", category: "Cultural", location: "Ring Road", time_slot: "11:00-13:00", duration: 2.0, durationUnit: "hours", estimatedCost: 0, rating: 4.2, latitude: 28.6366, longitude: 77.2475 },
        { name: "Travel to Mehrauli Archaeological Park", category: "Travel", distance: 17, distanceUnit: "km", duration: 23, durationUnit: "minutes", estimatedCost: 544, time_slot: "19:06-19:29", latitude: 28.5248, longitude: 77.1858 },
        { name: "Mehrauli Archaeological Park", category: "Offbeat", location: "Mehrauli", time_slot: "13:00-15:00", duration: 2.0, durationUnit: "hours", estimatedCost: 0, rating: 4.2, latitude: 28.5248, longitude: 77.1858 },
        { name: "Travel to Lotus Temple", category: "Travel", distance: 9, distanceUnit: "km", duration: 12, durationUnit: "minutes", estimatedCost: 288, time_slot: "19:29-19:41", latitude: 28.5535, longitude: 77.2588 },
        { name: "Lotus Temple", category: "Popular", location: "Kalkaji", time_slot: "15:00-19:00", duration: 4.0, durationUnit: "hours", estimatedCost: 0, rating: 4.3, latitude: 28.5535, longitude: 77.2588 }
      ],
      lunch: [
        { name: "The Big Chill", location: "Khan Market", price: 1500, rating: 4.4, latitude: 28.6007, longitude: 77.225 },
        { name: "Karim's", location: "Jama Masjid", price: 500, rating: 4.4, latitude: 28.6506, longitude: 77.2344 },
        { name: "Al Jawahar", location: "Old Delhi", price: 600, rating: 4.3, latitude: 28.6509, longitude: 77.2348 }
      ],
      stay: [
        { name: "The Lodhi", location: "Lodhi Road", pricePerNight: 20000, rating: 4.7, latitude: 28.5921, longitude: 77.2226 },
        { name: "The Oberoi, New Delhi", location: "Dr. Zakir Hussain Marg", pricePerNight: 28000, rating: 4.9, latitude: 28.6037, longitude: 77.2225 },
        { name: "The Claridges, New Delhi", location: "Dr APJ Abdul Kalam Road", pricePerNight: 19000, rating: 4.6, latitude: 28.59, longitude: 77.2 },
        { name: "ITC Maurya", location: "Sardar Patel Marg", pricePerNight: 18000, rating: 4.6, latitude: 28.5924, longitude: 77.1981 }
      ]
    },
    {
      day: 2,
      date: "2025-04-26",
      activities: [
        { name: "ISKCON Temple Delhi", category: "Popular", location: "Sant Nagar", time_slot: "09:00-11:00", duration: 2.0, durationUnit: "hours", estimatedCost: 0, rating: 4.4, latitude: 28.6267, longitude: 77.2098 },
        { name: "Travel to Chhatarpur Temple", category: "Travel", distance: 19, distanceUnit: "km", duration: 24, durationUnit: "minutes", estimatedCost: 608, time_slot: "19:00-19:24", latitude: 28.5086, longitude: 77.1531 },
        { name: "Chhatarpur Temple", category: "Popular", location: "Chhatarpur", time_slot: "11:00-13:00", duration: 2.0, durationUnit: "hours", estimatedCost: 0, rating: 4.4, latitude: 28.5086, longitude: 77.1531 },
        { name: "Travel to Lodhi Garden", category: "Travel", distance: 14, distanceUnit: "km", duration: 19, durationUnit: "minutes", estimatedCost: 448, time_slot: "19:24-19:43", latitude: 28.5931, longitude: 77.2167 },
        { name: "Lodhi Garden", category: "Nature", location: "Lodhi Estate", time_slot: "13:00-15:00", duration: 2.0, durationUnit: "hours", estimatedCost: 0, rating: 4.5, latitude: 28.5931, longitude: 77.2167 },
        { name: "Travel to India Gate", category: "Travel", distance: 3, distanceUnit: "km", duration: 4, durationUnit: "minutes", estimatedCost: 96, time_slot: "19:43-19:47", latitude: 28.6129, longitude: 77.2295 },
        { name: "India Gate", category: "Popular", location: "New Delhi", time_slot: "15:00-19:00", duration: 4.0, durationUnit: "hours", estimatedCost: 0, rating: 4.7, latitude: 28.6129, longitude: 77.2295 }
      ],
      lunch: [
        { name: "The Big Chill", location: "Khan Market", price: 1500, rating: 4.4, latitude: 28.6007, longitude: 77.225 },
        { name: "Karim's", location: "Jama Masjid", price: 500, rating: 4.4, latitude: 28.6506, longitude: 77.2344 },
        { name: "Al Jawahar", location: "Old Delhi", price: 600, rating: 4.3, latitude: 28.6509, longitude: 77.2348 }
      ],
      stay: [
        { name: "The Taj Mahal Hotel", location: "Mansingh Road", pricePerNight: 22000, rating: 4.7, latitude: 28.6119, longitude: 77.2195 },
        { name: "The Imperial, New Delhi", location: "Janpath", pricePerNight: 17000, rating: 4.6, latitude: 28.6124, longitude: 77.2175 },
        { name: "The Oberoi, New Delhi", location: "Dr. Zakir Hussain Marg", pricePerNight: 28000, rating: 4.9, latitude: 28.6037, longitude: 77.2225 },
        { name: "Shangri-La Eros, New Delhi", location: "Connaught Place", pricePerNight: 16000, rating: 4.5, latitude: 28.628, longitude: 77.22 }
      ]
    }
    // Add more days as needed
  ]
};


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
        // Assuming the response is an array of itinerary days (matching your backend response structure)
        setTripDays(data.itinerary || []);
        //if data is of the older format
        if(data.activities)
          setTripDays(itineraryData.itinerary);//set demo data
      } catch (err) {
        setError(err.message || 'Error fetching itinerary');
      } finally {
        setIsLoading(false);
      }
    };

    fetchItinerary();
  }, [tripId]);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleEditItinerary = () => {
    const formattedActivities = tripDays.flatMap((day, index) =>
      day.activities.map((activity) => ({
        id: `${activity.name}-${index}`,
        name: activity.name,
        category: activity.category || 'unknown',
        location: activity.location || 'N/A',
        estimatedCost: activity.estimatedCost || 0,
        time_slot: activity.time_slot || 'N/A',
        rating: activity.rating || 0,
        latitude: activity.latitude || 0,
        longitude: activity.longitude || 0,
      }))
    );

    navigate('/dashboard/plan/manual/generate', {
      state: {
        tripId,
        tripData: location.state?.tripData,
        spots: formattedActivities,
      },
    });
  };

  const currentDay = tripDays.length > 0 ? tripDays[activeDay] : null;
  const currentActivities = currentDay?.activities || [];
  const currentLunch = currentDay?.lunch || [];
  const currentStay = currentDay?.stay || [];

  // Filter out Travel activities and add type to locations
  const mappedLocations = [
    ...currentActivities
      .filter((activity) => activity.category !== 'Travel')
      .map((activity) => ({
        name: activity.name,
        coordinates: [activity.latitude, activity.longitude],
        rating: activity.rating,
        type: 'activity',
      })),
    ...currentLunch.map((lunch) => ({
      name: lunch.name,
      coordinates: [lunch.latitude, lunch.longitude],
      rating: lunch.rating,
      type: 'restaurant',
    })),
    ...currentStay.map((stay) => ({
      name: stay.name,
      coordinates: [stay.latitude, stay.longitude],
      rating: stay.rating,
      type: 'hotel',
    })),
  ];

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
        <div className="backdrop-blur-lg bg-white/30 border border-white/20 p-8 rounded-2xl shadow-2xl max-w-md w-full">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  if (tripDays.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
        <div className="backdrop-blur-lg bg-white/30 border border-white/20 p-8 rounded-2xl shadow-2xl max-w-md w-full">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">No Itinerary Found</h2>
          <p className="text-gray-600">Please create a trip to view its itinerary.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 font-['Inter',sans-serif]">
      <div className="w-full h-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 flex-1 flex flex-col h-full overflow-hidden">
          {/* Sticky Header with Day Tabs and Edit Button */}
          <div className="sticky top-0 z-20 backdrop-blur-lg bg-white/30 border-b border-white/20 py-6 mb-8">
            <div className="flex justify-between items-center">
              <div className="flex flex-wrap gap-3">
                {tripDays.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveDay(index)}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 transform backdrop-blur-sm border ${
                      activeDay === index
                        ? 'bg-emerald-500/90 text-white shadow-lg scale-105 border-emerald-400/50 shadow-emerald-500/25'
                        : 'bg-white/40 text-emerald-700 hover:bg-emerald-50/60 hover:shadow-md hover:scale-102 border-white/30 hover:border-emerald-200/50'
                    }`}
                  >
                    Day {day.day}
                    <div className="text-xs opacity-80">{day.date}</div>
                  </button>
                ))}
              </div>
              <button
                onClick={handleEditItinerary}
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium backdrop-blur-sm border border-emerald-400/30"
              >
                Edit Itinerary
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 flex-1 w-full overflow-hidden">
            {/* Activities, Restaurants, Hotels Sections */}
            <div className="lg:w-3/4 w-full overflow-y-auto pb-16" style={{ maxHeight: '600px' }}>
              {/* Activities Section */}
              <div className="mb-6">
                <button
                  onClick={() => toggleSection('activities')}
                  className="w-full flex justify-between items-center backdrop-blur-lg bg-emerald-500/90 text-white p-4 rounded-xl shadow-lg hover:bg-emerald-600/90 transition-all duration-300 border border-emerald-400/30"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="font-semibold text-lg">Activities</span>
                  </div>
                  <div
                    className={`transform transition-transform duration-300 ${
                      expandedSections.activities ? 'rotate-180' : ''
                    }`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </button>
                <div
                  className={`transition-all duration-500 ease-in-out overflow-hidden ${
                    expandedSections.activities ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="relative pl-12 mt-6 mb-16">
                    <div className="absolute left-[12px] top-0 w-[3px] bg-gradient-to-b from-emerald-400 to-emerald-600 h-full rounded-full shadow-sm"></div>
                    <div className="space-y-6">
                      {currentActivities.map((event, index) => (
                        <React.Fragment key={index}>
                          {event.category === 'Travel' ? (
                            <TravelCard
                              event={event}
                              isLast={index === currentActivities.length - 1}
                              isFirst={index === 0}
                            />
                          ) : (
                            <ActivityCard
                              event={event}
                              index={
                                currentActivities.filter((e, i) => e.category !== 'Travel' && i <= index)
                                  .length - 1
                              }
                              isLast={index === currentActivities.length - 1}
                              isFirst={index === 0}
                              onClick={() => setFocusedLocation([event.latitude, event.longitude])}
                            />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Restaurants Section */}
              <div className="mb-6">
                <button
                  onClick={() => toggleSection('restaurants')}
                  className="w-full flex justify-between items-center backdrop-blur-lg bg-emerald-500/90 text-white p-4 rounded-xl shadow-lg hover:bg-emerald-600/90 transition-all duration-300 border border-emerald-400/30"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                      </svg>
                    </div>
                    <span className="font-semibold text-lg">Restaurants</span>
                  </div>
                  <div
                    className={`transform transition-transform duration-300 ${
                      expandedSections.restaurants ? 'rotate-180' : ''
                    }`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </button>
                <div
                  className={`transition-all duration-500 ease-in-out overflow-hidden ${
                    expandedSections.restaurants ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="mt-6 mb-8 space-y-4">
                    {currentLunch.map((lunch, index) => (
                      <RestaurantCard
                        key={index}
                        restaurant={lunch}
                        onClick={() => setFocusedLocation([lunch.latitude, lunch.longitude])}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Hotels Section */}
              <div className="mb-6">
                <button
                  onClick={() => toggleSection('hotels')}
                  className="w-full flex justify-between items-center backdrop-blur-lg bg-emerald-500/90 text-white p-4 rounded-xl shadow-lg hover:bg-emerald-600/90 transition-all duration-300 border border-emerald-400/30"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                      </svg>
                    </div>
                    <span className="font-semibold text-lg">Hotels</span>
                  </div>
                  <div
                    className={`transform transition-transform duration-300 ${
                      expandedSections.hotels ? 'rotate-180' : ''
                    }`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </button>
                <div
                  className={`transition-all duration-500 ease-in-out overflow-hidden ${
                    expandedSections.hotels ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="mt-6 mb-8 space-y-4">
                    {currentStay.map((stay, index) => (
                      <HotelCard
                        key={index}
                        hotel={stay}
                        onClick={() => setFocusedLocation([stay.latitude, stay.longitude])}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="lg:w-1/4 w-full">
              <div
                className="backdrop-blur-lg bg-white/30 border border-white/20 rounded-2xl shadow-2xl p-6"
                style={{ height: '600px' }}
              >
                <div className="h-full rounded-xl overflow-hidden border-2 border-emerald-200/50 shadow-inner">
                  <MapComponent locations={mappedLocations} focusedLocation={focusedLocation} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}