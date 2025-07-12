import { useApp } from '../context/AppContext';
import { User } from '../lib/types';
import { apiService } from '../lib/api';
import { useState } from 'react';

export function useAuth() {
  const { state, dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.login(email, password);
      
      if (response.success) {
        const user: User = {
          id: response.data.user._id,
          name: response.data.user.username,
          email: response.data.user.email,
          avatar: response.data.user.avatar || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150',
          bio: response.data.user.bio || '',
          reputation: response.data.user.reputation || 1,
          badges: response.data.user.badges || [],
          joinDate: response.data.user.createdAt,
          role: response.data.user.role?.toLowerCase() || 'user'
        };
        
        dispatch({ type: 'LOGIN', payload: user });
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.register({
        username,
        email,
        password,
        role: 'USER'
      });

      if (response.success) {
        const user: User = {
          id: response.data._id,
          name: response.data.username,
          email: response.data.email,
          avatar: response.data.avatar || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150',
          bio: response.data.bio || '',
          reputation: response.data.reputation || 1,
          badges: response.data.badges || [],
          joinDate: response.data.createdAt,
          role: response.data.role?.toLowerCase() || 'user'
        };

        dispatch({ type: 'REGISTER', payload: user });
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await apiService.logout();
      dispatch({ type: 'LOGOUT' });
    } catch (err) {
      // Even if API call fails, we still log out locally
      dispatch({ type: 'LOGOUT' });
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = (updates: Partial<User>) => {
    if (state.currentUser) {
      dispatch({ 
        type: 'UPDATE_USER', 
        payload: { ...updates, id: state.currentUser.id } 
      });
    }
  };

  return {
    currentUser: state.currentUser,
    isAuthenticated: state.isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile
  };
}