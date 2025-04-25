// src/services/userService.js
import api from './api'; // Your configured axios instance

// Get user profile
export const getUserProfile = async () => {
  try {
    const response = await api.get('/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch user profile' };
  }
};