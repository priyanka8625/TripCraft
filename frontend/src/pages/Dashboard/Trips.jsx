import React, { useEffect, useState } from 'react';
import TripCard from '../../components/Dashboard/Trips/TripCard'; // Make sure the path is correct
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getAllTrips } from '../../services/tripService';

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const demoTrips = [
    {
      id: 1,
      name: 'Goa Getaway',
      destination: 'Goa, India',
      startDate: '2025-05-10',
      endDate: '2025-05-15',
      budget: '₹25,000',
      people: 4,
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e', // Beach
    },
    {
      id: 2,
      name: 'Manali Mountains',
      destination: 'Manali, Himachal',
      startDate: '2025-06-01',
      endDate: '2025-06-08',
      budget: '₹18,000',
      people: 2,
      image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e', // Mountains
    },
    {
      id: 3,
      name: 'Jaipur Heritage Tour',
      destination: 'Jaipur, Rajasthan',
      startDate: '2025-04-20',
      endDate: '2025-04-23',
      budget: '₹15,000',
      people: 3,
      image: 'https://images.unsplash.com/photo-1584277269068-9d08f1f79901', // Forts
    },
    {
      id: 4,
      name: 'Kerala Backwaters',
      destination: 'Alleppey, Kerala',
      startDate: '2025-07-05',
      endDate: '2025-07-10',
      budget: '₹20,000',
      people: 5,
      image: 'https://images.unsplash.com/photo-1549887534-cc9a171b2444', // Houseboat
    },
    {
      id: 5,
      name: 'Ladakh Adventure',
      destination: 'Leh, Ladakh',
      startDate: '2025-08-15',
      endDate: '2025-08-25',
      budget: '₹30,000',
      people: 4,
      image: 'https://images.unsplash.com/photo-1518684079-44ff1f52b72b', // Desert mountains
    },
    {
      id: 6,
      name: 'Andaman Islands',
      destination: 'Port Blair, Andaman',
      startDate: '2025-12-01',
      endDate: '2025-12-07',
      budget: '₹35,000',
      people: 2,
      image: 'https://images.unsplash.com/photo-1603246134989-6ce8fddd9834', // Tropical beach
    },
  ];
  const navigate = useNavigate();
  useEffect(() => {
    // Fetch trips from backend
    const fetchTrips = async () => {
      try {
        const response = await getAllTrips();
        setTrips(response); // Adjust if response structure is different
        // setTrips(demoTrips);
      } catch (error) {
        console.error('Error fetching trips:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  const handleTripClick = async (tripId) => {
    navigate('/dashboard/itinerary', { state: { tripId } });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Trips</h2>
      {loading ? (
        <p className="text-gray-500">Loading trips...</p>
      ) : trips.length === 0 ? (
        <p className="text-gray-500">No trips found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} onClick={handleTripClick} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Trips;
