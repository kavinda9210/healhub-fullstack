import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginResponse, User } from '../types/navigation';

const API_BASE_URL = 'http://192.168.1.100:5000/api'; // Change to your backend IP

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      AsyncStorage.removeItem('auth_token');
      AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  // Login with email/phone and password
  login: async (identifier: string, password: string): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', { identifier, password });
    return response.data.data;
  },

  // Register new user
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Verify email
  verifyEmail: async (email: string, code: string) => {
    const response = await api.post('/auth/verify-email', { email, code });
    return response.data;
  },

  // Resend verification code
  resendVerification: async (email: string) => {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (userId: string, token: string, password: string) => {
    const response = await api.post('/auth/reset-password', {
      userId,
      token,
      password,
      confirmPassword: password
    });
    return response.data;
  },

  // Get user profile
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data.data;
  },

  // Update profile
  updateProfile: async (updates: Partial<User>) => {
    const response = await api.put('/auth/profile', updates);
    return response.data.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

export default api;