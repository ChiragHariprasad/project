import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (uid: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (password: string) => Promise<{ success: boolean; uid?: string }>;
  isLoading: boolean;
  error: string | null;
  token: string | null;
}

const API_URL = 'http://localhost:5000/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      
      // Set axios auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    
    setIsLoading(false);
  }, []);

  const login = async (uid: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_URL}/users/login`, {
        uid,
        password
      });
      
      if (response.data.success) {
        const userData: User = {
          uid: response.data.uid,
          isAdmin: response.data.isAdmin
        };
        
        const userToken = response.data.token;
        
        setUser(userData);
        setToken(userToken);
        
        // Set auth header
        axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
        
        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', userToken);
        
        return true;
      } else {
        setError(response.data.message || 'Login failed');
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'An error occurred during login';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (password: string): Promise<{ success: boolean; uid?: string }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_URL}/users/register`, {
        password
      });
      
      if (response.data.success) {
        return { 
          success: true, 
          uid: response.data.uid 
        };
      } else {
        setError(response.data.message || 'Registration failed');
        return { success: false };
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'An error occurred during registration';
      setError(errorMessage);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Remove auth header
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isLoading, error, token }}>
      {children}
    </AuthContext.Provider>
  );
};