import api from './api';

// Service to create a new trip via POST API
export const createTripWithAi = async (tripData) => {
  try {
    const response = await api.post('/trips', tripData);
    return response.data; // Return the created trip data
  } catch (error) {
    // Throw error with message from API or default
    throw new Error(error.response?.data?.message || 'Failed to create trip');
  }
};

// Service to fetch a trip by ID via GET API
export const getItineraryWithTripId = async (tripId) => {
    try {
      const response = await api.get(`/itinerary/trip/${tripId}`);
      console.log(response.data);
      return response.data; // Return the Itinerary data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch trip');
    }
};

// get all trips
export const getAllTrips = async()=>{
  try {
    const response = await api.get(`/trips`);
    console.log(response.data);
    return response.data; // Return the Itinerary data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch trips');
  }
}