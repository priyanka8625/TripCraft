// src/services/authService.js
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
    const response = await api.post('/auth/logout');
    return response; // "logout successful"
};
