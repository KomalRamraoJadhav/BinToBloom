import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize user from localStorage immediately
  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      // Set user from localStorage immediately for faster UI
      if (token && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } catch (parseError) {
          console.error('Error parsing stored user:', parseError);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Verify token and fetch user profile after initial load
  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          // Verify token with backend
          const response = await api.get('/user/profile');
          const userData = response.data;
          // Preserve password field removal
          if (userData.password) {
            userData.password = undefined;
          }
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
          // Token invalid or expired
          if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
          // For network errors, keep using stored user data
          // Don't clear on network errors to prevent logout on temporary connection issues
        }
      }
    };

    // Only verify if we have a token
    const token = localStorage.getItem('token');
    if (token) {
      verifySession();
      
      // Verify session every 5 minutes
      const interval = setInterval(() => {
        const currentToken = localStorage.getItem('token');
        if (currentToken) {
          verifySession();
        }
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearInterval(interval);
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // Optionally call logout API endpoint
    api.post('/auth/logout').catch(() => {
      // Ignore errors on logout
    });
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/user/profile');
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {

    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};