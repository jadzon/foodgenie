// app/store/authStore.ts - Ulepszona wersja z lepszą obsługą 401

import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as SplashScreen from 'expo-splash-screen';
import { create } from 'zustand';
import { Platform } from 'react-native';
import { API_BASE_URL } from '../config/config';

// Web-compatible secure storage
const secureStorage = {
  getItemAsync: async (key: string) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(key);
      }
      return null;
    }
    return await SecureStore.getItemAsync(key);
  },
  
  setItemAsync: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value);
      }
      return;
    }
    return await SecureStore.setItemAsync(key, value);
  },
  
  deleteItemAsync: async (key: string) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key);
      }
      return;
    }
    return await SecureStore.deleteItemAsync(key);
  }
};

// TypeScript interfaces
interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  createdAt: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

interface AuthStore {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean | null;
  isLoading: boolean;
  error: string | null;
  isRefreshing: boolean; // Nowy flag dla procesu odświeżania
  
  _setTokens: (data: { accessToken: string | null; refreshToken: string | null; user: User | null }) => Promise<void>;
  clearError: () => void;
  checkAuthStatus: () => Promise<void>;
  register: (userData: RegisterData) => Promise<any>;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  attemptRefreshToken: (tokenToRefresh?: string) => Promise<boolean>;
  makeAuthenticatedRequest: (url: string, options?: RequestInit) => Promise<Response>;
  uploadMealImage: (imageUri: string) => Promise<any>;
  getMeals: (page?: number) => Promise<any>;
  getMealDetails: (mealId: string) => Promise<any>;
}

// Key names for secure storage
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_DATA_KEY = 'userData';

// Keep splash screen visible initially
SplashScreen.preventAutoHideAsync();

// Klasa do obsługi kolejki żądań podczas odświeżania tokenu
class TokenRefreshManager {
  private static instance: TokenRefreshManager;
  private refreshPromise: Promise<boolean> | null = null;
  private pendingRequests: Array<{
    resolve: (response: Response) => void;
    reject: (error: Error) => void;
    url: string;
    options: RequestInit;
  }> = [];

  static getInstance(): TokenRefreshManager {
    if (!TokenRefreshManager.instance) {
      TokenRefreshManager.instance = new TokenRefreshManager();
    }
    return TokenRefreshManager.instance;
  }

  async handleTokenRefresh(
    refreshTokenFn: () => Promise<boolean>,
    url: string,
    options: RequestInit
  ): Promise<Response> {
    // Jeśli już trwa odświeżanie, dodaj żądanie do kolejki
    if (this.refreshPromise) {
      return new Promise((resolve, reject) => {
        this.pendingRequests.push({ resolve, reject, url, options });
      });
    }

    // Rozpocznij odświeżanie tokenu
    this.refreshPromise = refreshTokenFn();

    try {
      const success = await this.refreshPromise;
      
      if (success) {
        // Token odświeżony pomyślnie, wykonaj oryginalne żądanie
        const newAccessToken = useAuthStore.getState().accessToken;
        const updatedOptions = {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${newAccessToken}`,
          },
        };

        const response = await fetch(url, updatedOptions);

        // Wykonaj wszystkie oczekujące żądania
        this.processPendingRequests(newAccessToken);

        return response;
      } else {
        // Odświeżanie nie powiodło się
        const error = new Error('Token refresh failed');
        this.rejectPendingRequests(error);
        throw error;
      }
    } finally {
      this.refreshPromise = null;
    }
  }

  private async processPendingRequests(accessToken: string | null) {
    const requests = [...this.pendingRequests];
    this.pendingRequests = [];

    for (const { resolve, reject, url, options } of requests) {
      try {
        const updatedOptions = {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${accessToken}`,
          },
        };
        const response = await fetch(url, updatedOptions);
        resolve(response);
      } catch (error) {
        reject(error as Error);
      }
    }
  }

  private rejectPendingRequests(error: Error) {
    const requests = [...this.pendingRequests];
    this.pendingRequests = [];
    requests.forEach(({ reject }) => reject(error));
  }
}

// API interaction functions
const api = {
  // Register new user
  register: async (userData: RegisterData) => {
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
  login: async (credentials: LoginCredentials) => {
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

  // Refresh access token - POPRAWIONA IMPLEMENTACJA
  refreshToken: async (refreshToken: string) => {
    console.log('Attempting to refresh token...');
    
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    
    console.log('Refresh response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Refresh token failed:', errorText);
      
      try {
        const error = JSON.parse(errorText);
        throw new Error(error.error || error.message || 'Token refresh failed');
      } catch {
        throw new Error(`Token refresh failed with status ${response.status}: ${errorText}`);
      }
    }
    
    const result = await response.json();
    console.log('Token refresh successful');
    return result;
  },

  // Get current user data
  getMe: async (accessToken: string) => {
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
  uploadMealImage: async (imageUri: string, accessToken: string) => {
    console.log('Starting upload for:', imageUri);
    
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'meal.jpg',
    } as any);

    console.log('Making request to:', `${API_BASE_URL}/meal/image`);

    const response = await fetch(`${API_BASE_URL}/meal/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData,
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload error response:', errorText);
      
      try {
        const error = JSON.parse(errorText);
        throw new Error(error.message || 'Failed to upload meal image');
      } catch {
        throw new Error(`Upload failed with status ${response.status}: ${errorText}`);
      }
    }
    
    const result = await response.json();
    console.log('Upload success:', result);
    return result;
  },

  // Get meals list for user
  getMeals: async (accessToken: string, page = 1) => {
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
  getMealDetails: async (accessToken: string, mealId: string) => {
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

const useAuthStore = create<AuthStore>((set: any, get: any) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: null,
  isLoading: true,
  error: null,
  isRefreshing: false, // Nowy flag

  // Helper to set tokens in state and secure storage
  _setTokens: async ({ accessToken, refreshToken, user }) => {
    try {
      if (accessToken) {
        await secureStorage.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
      } else {
        await secureStorage.deleteItemAsync(ACCESS_TOKEN_KEY);
      }

      if (refreshToken) {
        await secureStorage.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
      } else {
        await secureStorage.deleteItemAsync(REFRESH_TOKEN_KEY);
      }

      if (user) {
        await secureStorage.setItemAsync(USER_DATA_KEY, JSON.stringify(user));
      } else {
        await secureStorage.deleteItemAsync(USER_DATA_KEY);
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

  clearError: () => set({ error: null }),

  checkAuthStatus: async () => {
    set({ isLoading: true, error: null });
    try {
      const storedAccessToken = await secureStorage.getItemAsync(ACCESS_TOKEN_KEY);
      const storedRefreshToken = await secureStorage.getItemAsync(REFRESH_TOKEN_KEY);
      const storedUser = await secureStorage.getItemAsync(USER_DATA_KEY);

      if (storedAccessToken && storedUser) {
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
          if (storedRefreshToken) {
            console.log('Access token invalid, attempting refresh...');
            await get().attemptRefreshToken(storedRefreshToken);
          } else {
            await get()._setTokens({ accessToken: null, refreshToken: null, user: null });
          }
        }
      } else if (storedRefreshToken) {
        console.log('No access token, attempting refresh...');
        await get().attemptRefreshToken(storedRefreshToken);
      } else {
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

  register: async (userData: RegisterData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.register(userData);
      set({ isLoading: false });
      return response;
    } catch (error: any) {
      console.error("Registration failed:", error);
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const { accessToken, refreshToken } = await api.login(credentials);
      const userData = await api.getMe(accessToken);
      
      await get()._setTokens({ accessToken, refreshToken, user: userData });
      router.replace('/(tabs)');
    } catch (error: any) {
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

  // ULEPSZONA IMPLEMENTACJA ODŚWIEŻANIA TOKENU
  attemptRefreshToken: async (tokenToRefresh?: string) => {
    const refreshTokenToUse = tokenToRefresh || get().refreshToken;
    if (!refreshTokenToUse) {
      console.log('No refresh token available');
      await get()._setTokens({ accessToken: null, refreshToken: null, user: null });
      return false;
    }

    // Sprawdź czy już trwa odświeżanie
    if (get().isRefreshing) {
      console.log('Token refresh already in progress, waiting...');
      
      // Czekaj na zakończenie odświeżania
      while (get().isRefreshing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Sprawdź czy odświeżanie się powiodło
      return !!get().accessToken;
    }

    set({ isRefreshing: true, error: null });
    
    try {
      console.log('Starting token refresh process...');
      const { accessToken, refreshToken: newRefreshToken } = await api.refreshToken(refreshTokenToUse);
      
      // Get fresh user data with new token
      const userData = await api.getMe(accessToken);
      
      await get()._setTokens({ 
        accessToken, 
        refreshToken: newRefreshToken || refreshTokenToUse, 
        user: userData 
      });
      
      console.log('Token refresh successful');
      return true;
    } catch (error) {
      console.error("Token refresh failed:", error);
      // If refresh fails, log out the user
      await get()._setTokens({ accessToken: null, refreshToken: null, user: null });
      set({ error: 'Session expired. Please login again.' });
      router.replace('/auth/login');
      return false;
    } finally {
      set({ isRefreshing: false });
    }
  },

  // ULEPSZONA FUNKCJA DO UWIERZYTELNIONYCH ŻĄDAŃ
  makeAuthenticatedRequest: async (url: string, options: RequestInit = {}) => {
    const { accessToken, isRefreshing } = get();
    
    if (!accessToken) {
      throw new Error('No access token available');
    }

    // Pierwszy próba z aktualnym tokenem
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    // Jeśli dostaliśmy 401, spróbuj odświeżyć token
    if (response.status === 401 && !isRefreshing) {
      console.log('Got 401, attempting token refresh...');
      
      const refreshManager = TokenRefreshManager.getInstance();
      return refreshManager.handleTokenRefresh(
        () => get().attemptRefreshToken(),
        url,
        options
      );
    }

    return response;
  },

  // Upload meal image z automatycznym odświeżaniem tokenu
  uploadMealImage: async (imageUri: string) => {
    try {
      const { accessToken } = get();
      if (!accessToken) {
        throw new Error('No access token available');
      }

      // Pierwszy próba
      try {
        const result = await api.uploadMealImage(imageUri, accessToken);
        return result;
      } catch (error: any) {
        // Jeśli błąd może być związany z tokenem, spróbuj odświeżyć
        if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          console.log('Upload failed with auth error, attempting token refresh...');
          
          const refreshSuccess = await get().attemptRefreshToken();
          if (refreshSuccess) {
            const newAccessToken = get().accessToken;
            return await api.uploadMealImage(imageUri, newAccessToken!);
          }
        }
        throw error;
      }
    } catch (error: any) {
      console.error("Meal image upload failed:", error);
      throw error;
    }
  },

  // Get meals list z automatycznym odświeżaniem tokenu
  getMeals: async (page = 1) => {
    try {
      const { accessToken } = get();
      if (!accessToken) {
        throw new Error('No access token available');
      }

      try {
        const result = await api.getMeals(accessToken, page);
        return result;
      } catch (error: any) {
        if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          console.log('Get meals failed with auth error, attempting token refresh...');
          
          const refreshSuccess = await get().attemptRefreshToken();
          if (refreshSuccess) {
            const newAccessToken = get().accessToken;
            return await api.getMeals(newAccessToken!, page);
          }
        }
        throw error;
      }
    } catch (error: any) {
      console.error("Get meals failed:", error);
      throw error;
    }
  },

  // Get meal details z automatycznym odświeżaniem tokenu
  getMealDetails: async (mealId: string) => {
    try {
      const { accessToken } = get();
      if (!accessToken) {
        throw new Error('No access token available');
      }

      try {
        const result = await api.getMealDetails(accessToken, mealId);
        return result;
      } catch (error: any) {
        if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          console.log('Get meal details failed with auth error, attempting token refresh...');
          
          const refreshSuccess = await get().attemptRefreshToken();
          if (refreshSuccess) {
            const newAccessToken = get().accessToken;
            return await api.getMealDetails(newAccessToken!, mealId);
          }
        }
        throw error;
      }
    } catch (error: any) {
      console.error("Get meal details failed:", error);
      throw error;
    }
  },
}));

// Initialize auth check
useAuthStore.getState().checkAuthStatus();

export default useAuthStore;