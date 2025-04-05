// This component wraps the Signup page to handle authentication redirects
// If user is already authenticated, redirects to dashboard
// If not authenticated, shows the signup page
// Uses useAuth hook to check authentication status
import React from 'react';
import { Navigate } from 'react-router-dom';
import Signup from '../pages/Signup';
import useAuth from '../hooks/useAuth';

const SignupRedirectWrapper = () => {
  const { isAuthenticated, authChecked } = useAuth();

  if (!authChecked) return <div>Loading...</div>;

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Signup />;
};

export default SignupRedirectWrapper;
