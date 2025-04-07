// src/services/authService.js
import toast from 'react-hot-toast';
import api from './api';

export const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response;
};


export const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response; // "login successful"
};

export const logout = async () => {
    try {
        const response = await api.post('/auth/logout');
        window.location.href = '/login'; // or use navigate('/login') if using react-router
        toast.success(response.data.message);
      } catch (err) {
        toast.success("Logout failed!");
        console.error('Logout failed', err);
      }
};
