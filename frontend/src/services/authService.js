// src/services/authService.js
import api from './api';

export const login = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  return response; // "login successful"
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response; // "logout successful"
};
