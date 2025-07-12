import { createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../services/api';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
} from './authSlice';

// Register user
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(registerStart());
      const response = await apiService.register(userData);
      dispatch(registerSuccess(response.data));
      return response.data;
    } catch (error) {
      const errorMessage = error.message || 'Registration failed';
      dispatch(registerFailure(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);

// Login user
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      dispatch(loginStart());
      const response = await apiService.login(credentials);
      dispatch(loginSuccess(response.data));
      return response.data;
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      dispatch(loginFailure(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);

// Logout user
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      await apiService.logout();
    } catch (error) {
      // Even if logout fails on server, clear local state
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'auth/logout' });
    }
  }
);
