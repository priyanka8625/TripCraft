import api from './api';

export const addCollaborator = async (tripId, email) => {
  try {
    const response = await api.post('/add-collaborator', { tripId, email });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to add collaborator');
  }
};