import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthContextType, RegisterData } from '../types';
import { authAPI } from '../services/api';
import { socketService } from '../services/socket';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authAPI
        .getCurrentUser()
        .then((response) => {
          setUser(response.data);
          // Connect to socket when user is authenticated
          socketService.connect(response.data.id);
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }

    // Cleanup socket connection on unmount
    return () => {
      socketService.disconnect();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      setUser(userData);
      
      // Connect to socket after login
      socketService.connect(userData.id);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await authAPI.register(userData);
      const { token, user: newUser } = response.data;
      
      localStorage.setItem('token', token);
      setUser(newUser);
      
      // Connect to socket after registration
      socketService.connect(newUser.id);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    // Disconnect socket on logout
    socketService.disconnect();
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      const response = await authAPI.updateProfile({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        phone: userData.phone || '',
      });
      setUser(response.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Profile update failed');
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    updateProfile,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};