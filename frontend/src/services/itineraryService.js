import api from './api';

// Service to create a new trip via POST API
export const createItinerary = async (itinerary) => {
    try {
      const response = await api.post('/itinerary', itinerary);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to save itinerary'
      );
    }
};

