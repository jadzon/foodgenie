// store/authStore.js
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as SplashScreen from 'expo-splash-screen';
import { create } from 'zustand';

// Key names for secure storage
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// Keep splash screen visible initially
SplashScreen.preventAutoHideAsync();

// --- Your API interaction functions (replace with your actual API calls) ---
// These are conceptual and you'll need to implement them using fetch, axios, etc.
const api = {
  login: async (credentials) => {
    // Simulate API call
    console.log('Attempting login with:', credentials);
    await new Promise(resolve => setTimeout(resolve, 1000));
    // In a real app, this would be:
    // const response = await fetch('YOUR_SERVER_URL/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(credentials),
    // });
    // if (!response.ok) throw new Error('Login failed');
    // const data = await response.json(); // { accessToken: '...', refreshToken: '...', user: {...} }
    // return data;

    // For demonstration:
    if (credentials.email === 'test@example.com' && credentials.password === 'password') {
      return {
        accessToken: 'fake-access-token-' + Date.now(),
        refreshToken: 'fake-refresh-token-' + Date.now(),
        user: { id: '1', name: 'Test User', email: credentials.email },
      };
    }
    throw new Error('Invalid credentials');
  },
  refreshToken: async (currentRefreshToken) => {
    console.log('Attempting to refresh token with:', currentRefreshToken);
    await new Promise(resolve => setTimeout(resolve, 1000));
    // const response = await fetch('YOUR_SERVER_URL/refresh_token', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ refreshToken: currentRefreshToken }),
    // });
    // if (!response.ok) throw new Error('Token refresh failed');
    // const data = await response.json(); // { accessToken: '...', refreshToken: '...' (optional new refresh token) }
    // return data;

    // For demonstration (simulate successful refresh):
    return {
      accessToken: 'new-fake-access-token-' + Date.now(),
      refreshToken: currentRefreshToken, // Or a new refresh token if your server provides one
    };
  },
  logout: async (token) => {
    // Optional: Call server to invalidate token
    console.log('Logging out with token (optional server call):', token);
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  }
};
// --- End of conceptual API functions ---


const useAuthStore = create((set, get) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: null, // null: loading, false: not authenticated, true: authenticated
  isLoading: true,

  // Helper to set tokens in state and secure storage
  _setTokens: async ({ accessToken, refreshToken, user }) => {
    if (accessToken) await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    else await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);

    if (refreshToken) await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    else await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);

    set({ accessToken, refreshToken, user, isAuthenticated: !!accessToken, isLoading: false });
  },

  checkAuthStatus: async () => {
    set({ isLoading: true });
    try {
      const storedAccessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      const storedRefreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

      if (storedAccessToken) {
        // TODO: Optionally validate access token with a quick server call if it might be expired
        // For now, assume if it exists, it's good enough for initial check
        // You might also fetch user profile here if not stored
        set({ accessToken: storedAccessToken, refreshToken: storedRefreshToken, isAuthenticated: true });
      } else if (storedRefreshToken) {
        // No access token, but have a refresh token, try to refresh
        console.log('No access token, attempting refresh...');
        await get().attemptRefreshToken(storedRefreshToken); // This will update state internally
      } else {
        // No tokens found
        set({ isAuthenticated: false });
      }
    } catch (e) {
      console.error("Failed to check auth status:", e);
      await get()._setTokens({ accessToken: null, refreshToken: null, user: null }); // Clear everything
    } finally {
      set({ isLoading: false });
      SplashScreen.hideAsync();
    }
  },

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const { accessToken, refreshToken, user } = await api.login(credentials);
      await get()._setTokens({ accessToken, refreshToken, user });
      router.replace('/(app)/(tabs)/library'); // Or your default authenticated screen
    } catch (error) {
      console.error("Login failed:", error);
      set({ isLoading: false, isAuthenticated: false }); // Ensure state reflects login failure
      // You might want to set an error message in the store to display on the login screen
      throw error; // Re-throw for the UI to catch if needed
    }
  },

  logout: async () => {
    const currentToken = get().accessToken;
    if (currentToken) {
      try {
        await api.logout(currentToken); // Optional: Invalidate token on server
      } catch (e) {
        console.warn("Server logout failed (token might already be invalid):", e);
      }
    }
    await get()._setTokens({ accessToken: null, refreshToken: null, user: null });
    router.replace('/(auth)/login');
  },

  attemptRefreshToken: async (tokenToRefresh) => {
    const refreshTokenToUse = tokenToRefresh || get().refreshToken;
    if (!refreshTokenToUse) {
      // No refresh token available, treat as logout
      await get()._setTokens({ accessToken: null, refreshToken: null, user: null });
      return false;
    }
    set({ isLoading: true }); // Indicate loading during token refresh
    try {
      const { accessToken, refreshToken: newRefreshToken } = await api.refreshToken(refreshTokenToUse);
      // The user object might need to be re-fetched or assumed to be the same
      await get()._setTokens({ accessToken, refreshToken: newRefreshToken || refreshTokenToUse, user: get().user });
      return true;
    } catch (error) {
      console.error("Token refresh failed:", error);
      // If refresh fails (e.g., refresh token expired/invalid), log out the user
      await get().logout(); // This will clear tokens and redirect
      return false;
    } finally {
      // isLoading might be set to false by _setTokens or logout, ensure it is.
      if(get().isLoading) set({ isLoading: false });
    }
  },
}));

// IMPORTANT: Call checkAuthStatus once when the store is initialized
useAuthStore.getState().checkAuthStatus();

export default useAuthStore;