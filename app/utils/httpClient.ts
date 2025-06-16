// app/utils/httpClient.ts - Pomocniczy HTTP client z automatycznym odświeżaniem tokenów

import useAuthStore from '../store/authStore';
import { API_BASE_URL } from '../config/config';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

export class HttpClient {
  private static instance: HttpClient;
  private refreshingPromise: Promise<boolean> | null = null;

  static getInstance(): HttpClient {
    if (!HttpClient.instance) {
      HttpClient.instance = new HttpClient();
    }
    return HttpClient.instance;
  }

  /**
   * Wykonuje żądanie HTTP z automatycznym odświeżaniem tokenu w przypadku 401
   */
  async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
    requireAuth: boolean = true
  ): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    
    if (requireAuth) {
      return this.makeAuthenticatedRequest<T>(url, options);
    } else {
      return this.makeRequest<T>(url, options);
    }
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, requireAuth: boolean = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' }, requireAuth);
  }

  /**
   * POST request
   */
  async post<T = any>(
    endpoint: string,
    body?: any,
    requireAuth: boolean = true,
    isFormData: boolean = false
  ): Promise<T> {
    const options: RequestInit = {
      method: 'POST',
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
      body: isFormData ? body : JSON.stringify(body),
    };

    return this.request<T>(endpoint, options, requireAuth);
  }

  /**
   * PUT request
   */
  async put<T = any>(endpoint: string, body?: any, requireAuth: boolean = true): Promise<T> {
    const options: RequestInit = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    };

    return this.request<T>(endpoint, options, requireAuth);
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string, requireAuth: boolean = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' }, requireAuth);
  }

  /**
   * Upload file (multipart/form-data)
   */
  async upload<T = any>(endpoint: string, formData: FormData): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
    }, true);
  }

  /**
   * Wykonuje żądanie bez uwierzytelnienia
   */
  private async makeRequest<T>(url: string, options: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Wykonuje uwierzytelnione żądanie z automatycznym odświeżaniem tokenu
   */
  private async makeAuthenticatedRequest<T>(url: string, options: RequestInit): Promise<T> {
    const authStore = useAuthStore.getState();
    let { accessToken } = authStore;

    if (!accessToken) {
      throw new Error('No access token available');
    }

    // Pierwszy próba z aktualnym tokenem
    let response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    // Jeśli dostaliśmy 401 i nie ma w toku odświeżania tokenu
    if (response.status === 401 && !authStore.isRefreshing) {
      console.log('Got 401, attempting token refresh...');

      // Jeśli już trwa odświeżanie, czekaj na nie
      if (this.refreshingPromise) {
        await this.refreshingPromise;
      } else {
        // Rozpocznij odświeżanie tokenu
        this.refreshingPromise = authStore.attemptRefreshToken();
        const refreshSuccess = await this.refreshingPromise;
        this.refreshingPromise = null;

        if (!refreshSuccess) {
          throw new Error('Token refresh failed');
        }
      }

      // Ponów żądanie z nowym tokenem
      const newAccessToken = useAuthStore.getState().accessToken;
      if (newAccessToken) {
        response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${newAccessToken}`,
          },
        });
      } else {
        throw new Error('No access token after refresh');
      }
    }

    return this.handleResponse<T>(response);
  }

  /**
   * Obsługuje odpowiedź HTTP i rzuca błędy w przypadku problemów
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // Jeśli nie można sparsować JSON, użyj domyślnej wiadomości
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
          }
        } catch {
          // Ostatnia opcja - użyj statusu HTTP
        }
      }

      throw new Error(errorMessage);
    }

    // Sprawdź czy odpowiedź zawiera JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    // Jeśli nie JSON, zwróć jako tekst
    return (await response.text()) as unknown as T;
  }
}

// Eksportuj singleton instance
export const httpClient = HttpClient.getInstance();

// Pomocnicze funkcje dla łatwego użycia
export const api = {
  // Auth endpoints
  auth: {
    login: (credentials: { username: string; password: string }) =>
      httpClient.post('/auth/login', credentials, false),
    
    register: (userData: any) =>
      httpClient.post('/auth/register', userData, false),
    
    refresh: (refreshToken: string) =>
      httpClient.post('/auth/refresh', { refreshToken }, false),
    
    me: () => httpClient.get('/users/me'),
  },

  // Meals endpoints
  meals: {
    list: (page: number = 1) => 
      httpClient.get(`/meals?page=${page}`),
    
    get: (id: string) => 
      httpClient.get(`/meals/${id}`),
    
    upload: (formData: FormData) => 
      httpClient.upload('/meal/image', formData),
    
    delete: (id: string) => 
      httpClient.delete(`/meals/${id}`),
  },
};

export default httpClient;