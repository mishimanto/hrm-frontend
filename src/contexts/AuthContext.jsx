import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

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

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      authService.getMe()
        .then(response => {
          setUser(response.user);
        })
        .catch(() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('user', JSON.stringify(response.user));
    setUser(response.user);
    return response;
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('user', JSON.stringify(response.user));
    setUser(response.user);
    return response;
  };

  const logout = async () => {
    await authService.logout();
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // inside AuthProvider
  const refreshUser = async () => {
    try {
      const res = await authService.getMe();
      // backend returns { user: { ... } }
      setUser(res.user);
      localStorage.setItem('user', JSON.stringify(res.user));
    } catch (err) {
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  // And include refreshUser in value:
  const value = {
    user,
    login,
    register,
    logout,
    loading,
    refreshUser, // <-- add this
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};