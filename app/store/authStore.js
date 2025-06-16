// store/authStore.js
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as SplashScreen from 'expo-splash-screen';
import { create } from 'zustand';

// Key names for secure storage
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_DATA_KEY = 'userData';

// API base URL - Use 10.0.2.2 for Android emulator instead of localhost
const API_BASE_URL = 'http://192.168.8.135:8080//api';

// Keep splash screen visible initially
SplashScreen.preventAutoHideAsync();

// API interaction functions
const api = {
  // Register new user
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }
    
    return await response.json();
  },

  // Login user
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    
    return await response.json();
  },

  // Refresh access token
  refreshToken: async (refreshToken) => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Token refresh failed');
    }
    
    return await response.json();
  },

  // Get current user data
  getMe: async (accessToken) => {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get user data');
    }
    
    return await response.json();
  },
  // Upload meal image
  uploadMealImage: async (imageUri, accessToken) => {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'meal.jpg',
    });

    const response = await fetch(`${API_BASE_URL}/meal/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload meal image');
    }
    
    return await response.json();
  },

  // Get meals list for user
  getMeals: async (accessToken, page = 1) => {
    const response = await fetch(`${API_BASE_URL}/meals?page=${page}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get meals');
    }
    
    return await response.json();
  },

  // Get meal details by ID
  getMealDetails: async (accessToken, mealId) => {
    const response = await fetch(`${API_BASE_URL}/meals/${mealId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get meal details');
    }
    
    return await response.json();
  }
};


const useAuthStore = create((set, get) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: null, // null: loading, false: not authenticated, true: authenticated
  isLoading: true,
  error: null,

  // Helper to set tokens in state and secure storage
  _setTokens: async ({ accessToken, refreshToken, user }) => {
    try {
      if (accessToken) {
        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
      } else {
        await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      }

      if (refreshToken) {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
      } else {
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      }

      if (user) {
        await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(user));
      } else {
        await SecureStore.deleteItemAsync(USER_DATA_KEY);
      }

      set({ 
        accessToken, 
        refreshToken, 
        user, 
        isAuthenticated: !!accessToken, 
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Error saving tokens:', error);
      set({ error: 'Failed to save authentication data' });
    }
  },

  // Clear any error messages
  clearError: () => set({ error: null }),

  checkAuthStatus: async () => {
    set({ isLoading: true, error: null });
    try {
      const storedAccessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      const storedRefreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      const storedUser = await SecureStore.getItemAsync(USER_DATA_KEY);

      if (storedAccessToken && storedUser) {
        // Try to get fresh user data to verify token is still valid
        try {
          const userData = await api.getMe(storedAccessToken);
          set({ 
            accessToken: storedAccessToken, 
            refreshToken: storedRefreshToken, 
            user: userData, 
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error) {
          // Access token might be expired, try refresh
          if (storedRefreshToken) {
            console.log('Access token invalid, attempting refresh...');
            await get().attemptRefreshToken(storedRefreshToken);
          } else {
            // No refresh token, need to login again
            await get()._setTokens({ accessToken: null, refreshToken: null, user: null });
          }
        }
      } else if (storedRefreshToken) {
        // No access token, but have a refresh token, try to refresh
        console.log('No access token, attempting refresh...');
        await get().attemptRefreshToken(storedRefreshToken);
      } else {
        // No tokens found
        set({ isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      console.error("Failed to check auth status:", error);
      await get()._setTokens({ accessToken: null, refreshToken: null, user: null });
      set({ error: 'Authentication check failed' });
    } finally {
      SplashScreen.hideAsync();
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.register(userData);
      // Registration successful, but user still needs to login
      set({ isLoading: false });
      return response;
    } catch (error) {
      console.error("Registration failed:", error);
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const { accessToken, refreshToken } = await api.login(credentials);
      
      // Get user data after successful login
      const userData = await api.getMe(accessToken);
      
      await get()._setTokens({ accessToken, refreshToken, user: userData });
      
      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error) {
      console.error("Login failed:", error);
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await get()._setTokens({ accessToken: null, refreshToken: null, user: null });
      router.replace('/auth/login');
    } catch (error) {
      console.error("Logout failed:", error);
      set({ error: 'Logout failed' });
    }
  },

  attemptRefreshToken: async (tokenToRefresh) => {
    const refreshTokenToUse = tokenToRefresh || get().refreshToken;
    if (!refreshTokenToUse) {
      // No refresh token available, treat as logout
      await get()._setTokens({ accessToken: null, refreshToken: null, user: null });
      return false;
    }

    set({ isLoading: true, error: null });
    try {
      const { accessToken, refreshToken: newRefreshToken } = await api.refreshToken(refreshTokenToUse);
      
      // Get fresh user data with new token
      const userData = await api.getMe(accessToken);
      
      await get()._setTokens({ 
        accessToken, 
        refreshToken: newRefreshToken || refreshTokenToUse, 
        user: userData 
      });
      return true;
    } catch (error) {
      console.error("Token refresh failed:", error);
      // If refresh fails, log out the user
      await get().logout();
      set({ error: 'Session expired. Please login again.' });
      return false;
    }
  },

  // Helper function to make authenticated API calls
  makeAuthenticatedRequest: async (url, options = {}) => {
    const { accessToken } = get();
    
    if (!accessToken) {
      throw new Error('No access token available');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    // If token is expired, try to refresh and retry
    if (response.status === 401) {
      const refreshSuccess = await get().attemptRefreshToken();
      if (refreshSuccess) {
        // Retry the request with new token
        const newAccessToken = get().accessToken;
        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${newAccessToken}`,
          },
        });
      }
    }

    return response;
  },
  // Upload meal image
  uploadMealImage: async (imageUri) => {
    set({ isLoading: true, error: null });
    try {
      const { accessToken } = get();
      const result = await api.uploadMealImage(imageUri, accessToken);
      set({ isLoading: false });
      return result;
    } catch (error) {
      console.error("Meal image upload failed:", error);
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Get meals list
  getMeals: async (page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const { accessToken } = get();
      if (!accessToken) {
        throw new Error('No access token available');
      }
      const result = await api.getMeals(accessToken, page);
      set({ isLoading: false });
      return result;
    } catch (error) {
      console.error("Get meals failed:", error);
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Get meal details
  getMealDetails: async (mealId) => {
    set({ isLoading: true, error: null });
    try {
      const { accessToken } = get();
      if (!accessToken) {
        throw new Error('No access token available');
      }
      const result = await api.getMealDetails(accessToken, mealId);
      set({ isLoading: false });
      return result;
    } catch (error) {
      console.error("Get meal details failed:", error);
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
}));

// IMPORTANT: Call checkAuthStatus once when the store is initialized
useAuthStore.getState().checkAuthStatus();

export default useAuthStore;