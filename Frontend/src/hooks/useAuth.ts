import { useApp } from '../context/AppContext';
import { User } from '../lib/types';

export function useAuth() {
  const { state, dispatch } = useApp();

  const login = (email: string, password: string): boolean => {
    // Mock authentication - in real app, this would call an API
    const user = state.users.find(u => u.email === email);
    if (user && password === 'password') {
      dispatch({ type: 'LOGIN', payload: user });
      return true;
    }
    return false;
  };

  const register = (name: string, email: string): boolean => {
    // Check if user already exists
    const existingUser = state.users.find(u => u.email === email);
    if (existingUser) {
      return false;
    }

    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      avatar: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150',
      bio: '',
      reputation: 1,
      badges: [],
      joinDate: new Date().toISOString(),
      role: 'user'
    };

    dispatch({ type: 'REGISTER', payload: newUser });
    return true;
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
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
    login,
    register,
    logout,
    updateProfile
  };
}