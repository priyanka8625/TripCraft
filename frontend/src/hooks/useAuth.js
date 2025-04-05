import { useState, useEffect } from 'react';
import api from '../services/api';
// This custom hook (useAuth) manages authentication state in the application

// Purpose:
// 1. Tracks whether the user is authenticated
// 2. Tracks whether the initial auth check has completed
// 3. Automatically checks auth status when component mounts

// The hook makes an API call to /auth/status endpoint to verify
// authentication status on mount and updates state accordingly

const useAuth = () => {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get('/auth/status');
        setIsAuthenticated(res.data.authenticated);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, []);

  return { isAuthenticated, authChecked };
};

export default useAuth;
