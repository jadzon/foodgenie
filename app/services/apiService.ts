import useAuthStore from '../store/authStore';
import { API_BASE_URL } from '../config/config';

// API Configuration - moved to config file
// const API_BASE_URL = 'http://192.168.0.157:8080/api';

export interface Ingredient {
  id: string;
  name: string;
  weight: number;
  calories: number;
}

export interface Meal {
  id: string;
  name: string;
  ingredients: Ingredient[];
  totalWeight: number;
  totalCalories: number;
  createdAt: string;
  updatedAt: string;
}

export interface MealsResponse {
  meals: Meal[];
  page: number;
}

class ApiService {  private getAuthToken(): string | null {
    const authStore = useAuthStore.getState();
    return authStore.accessToken;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    console.log(`Making API request to: ${API_BASE_URL}${endpoint}`);
    console.log('Headers:', headers);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getMeals(page: number = 1): Promise<MealsResponse> {
    try {
      const response = await this.makeRequest<MealsResponse>(`/meals?page=${page}`);
      return response;
    } catch (error) {
      console.error('Error fetching meals:', error);
      throw error;
    }
  }

  async getMealDetails(mealId: string): Promise<Meal> {
    try {
      const response = await this.makeRequest<Meal>(`/meals/${mealId}`);
      return response;
    } catch (error) {
      console.error('Error fetching meal details:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
