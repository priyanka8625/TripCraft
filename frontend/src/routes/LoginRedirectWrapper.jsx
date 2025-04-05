// This component wraps the Login page to handle authentication redirects
// If user is already authenticated, redirects to dashboard
// If not authenticated, shows the login page
// Uses useAuth hook to check authentication status

import React from 'react';
import { Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import useAuth from '../hooks/useAuth';

const LoginRedirectWrapper = () => {
  const { isAuthenticated, authChecked } = useAuth();

  if (!authChecked) return <div>Loading...</div>;

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />;
};

export default LoginRedirectWrapper;
