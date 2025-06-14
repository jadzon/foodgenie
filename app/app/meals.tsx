import { router } from 'expo-router';
import { RefreshCw, ChefHat, Calendar, Zap } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useAuthStore from '../store/authStore';

// Error boundary component for safer rendering
const SafeText = ({ children, fallback = "Błąd wyświetlania", ...props }: any) => {
  try {
    if (children === null || children === undefined) {
      return <Text {...props}>{fallback}</Text>;
    }
    
    // Ensure children is a string
    const safeChildren = String(children);
    return <Text {...props}>{safeChildren}</Text>;
  } catch (error) {
    console.error('SafeText error:', error);
    return <Text {...props}>{fallback}</Text>;
  }
};

interface Meal {
  id: string;
  name: string;
  totalWeight: number;
  totalCalories: number;
  createdAt: string;
  updatedAt: string;
}

interface MealsResponse {
  meals: Meal[];
  page: number;
  total?: number;
  totalPages?: number;
}

// Sanitize meal data to ensure safe rendering
const sanitizeMeal = (meal: any): Meal => {
  if (!meal || typeof meal !== 'object') {
    return {
      id: '',
      name: 'Nieznany posiłek',
      totalWeight: 0,
      totalCalories: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  return {
    id: String(meal.id || ''),
    name: String(meal.name || 'Nieznany posiłek').trim(),
    totalWeight: Number(meal.totalWeight) || 0,
    totalCalories: Number(meal.totalCalories) || 0,
    createdAt: String(meal.createdAt || new Date().toISOString()),
    updatedAt: String(meal.updatedAt || new Date().toISOString()),
  };
};

const MealItem = ({ meal }: { meal: Meal }) => {
  // Ensure meal exists and is valid
  if (!meal || !meal.id) {
    return null;
  }
  
  // Additional sanitization at render time
  const safeMeal = sanitizeMeal(meal);

  const formatDate = (dateString: string) => {
    try {
      if (!dateString || typeof dateString !== 'string') return 'Nieznana data';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Nieznana data';
      return date.toLocaleDateString('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Nieznana data';
    }
  };

  const handlePress = () => {
    try {
      if (!safeMeal.id) {
        Alert.alert('Błąd', 'Nieprawidłowe ID posiłku');
        return;
      }
      router.push(`/meals/${safeMeal.id}`);
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Błąd', 'Nie udało się otworzyć szczegółów posiłku');
    }
  };

  // Ensure all values are properly converted to strings for display
  const displayName = String(safeMeal.name || 'Nieznany posiłek');
  const displayWeight = String(Math.round(Number(safeMeal.totalWeight) || 0));
  const displayCalories = String(Math.round(Number(safeMeal.totalCalories) || 0));

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="bg-raisin-black border border-brand-pink/20 rounded-2xl p-5 mb-4 mx-4"
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <SafeText 
            className="text-xl font-exo2-semibold text-white mb-2" 
            numberOfLines={2}
            fallback="Nieznany posiłek"
          >
            {displayName}
          </SafeText>
          
          <View className="flex-row items-center mb-2">
            <Calendar size={16} color="#9CA3AF" strokeWidth={1.5} />
            <SafeText 
              className="text-sm text-gray-400 font-exo2 ml-2"
              fallback="Nieznana data"
            >
              {formatDate(safeMeal.createdAt)}
            </SafeText>
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <ChefHat size={16} color="#f7438d" strokeWidth={1.5} />
              <SafeText 
                className="text-sm text-brand-pink font-exo2-semibold ml-1"
                fallback="0g"
              >
                {displayWeight}g
              </SafeText>
            </View>
            
            <View className="flex-row items-center">
              <Zap size={16} color="#f7438d" strokeWidth={1.5} />
              <SafeText 
                className="text-sm text-brand-pink font-exo2-semibold ml-1"
                fallback="0 kcal"
              >
                {displayCalories} kcal
              </SafeText>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const MealsScreen = () => {
  const insets = useSafeAreaInsets();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const { getMeals, isAuthenticated } = useAuthStore();
  const fetchMeals = async (pageNum = 1, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      console.log('Fetching meals for page:', pageNum);
      const response: MealsResponse = await getMeals(pageNum);
      console.log('Raw response:', JSON.stringify(response, null, 2));
      
      // Validate response structure
      if (!response || typeof response !== 'object') {
        console.error('Invalid response format:', response);
        throw new Error('Invalid response format');
      }

      // Ensure meals is an array and sanitize the data
      const mealsArray = Array.isArray(response.meals) ? response.meals : [];
      console.log('Meals array before sanitization:', mealsArray);
      
      const sanitizedMeals = mealsArray
        .filter(meal => {
          const isValid = meal && typeof meal === 'object';
          if (!isValid) {
            console.warn('Filtering out invalid meal:', meal);
          }
          return isValid;
        })
        .map((meal, index) => {
          console.log(`Sanitizing meal ${index}:`, meal);
          const sanitized = sanitizeMeal(meal);
          console.log(`Sanitized meal ${index}:`, sanitized);
          return sanitized;
        })
        .filter(meal => {
          const hasId = meal.id;
          if (!hasId) {
            console.warn('Filtering out meal without ID:', meal);
          }
          return hasId;
        });
      
      console.log('Final sanitized meals:', sanitizedMeals);
      
      if (isRefresh || pageNum === 1) {
        setMeals(sanitizedMeals);
      } else {
        setMeals(prev => [...prev, ...sanitizedMeals]);
      }
      
      setPage(Number(response.page) || pageNum);
    } catch (error: any) {
      console.error('Error fetching meals:', error);
      Alert.alert('Błąd', 'Nie udało się pobrać listy posiłków: ' + (error.message || 'Nieznany błąd'));
      // Set empty array on error to prevent crashes
      if (isRefresh || pageNum === 1) {
        setMeals([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  useEffect(() => {
    if (isAuthenticated) {
      fetchMeals();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const onRefresh = () => {
    fetchMeals(1, true);
  };

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center px-8">
      <ChefHat size={64} color="#9CA3AF" strokeWidth={1} />
      <Text className="text-xl font-exo2-semibold text-gray-400 mt-4 text-center">
        Brak posiłków
      </Text>
      <Text className="text-base font-exo2 text-gray-500 mt-2 text-center">
        Zrób zdjęcie swojego pierwszego posiłku!
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View className="px-4 mb-6">
      <Text className="text-3xl font-exo2-bold text-white mb-2">
        Twoje Posiłki
      </Text>
      <Text className="text-base font-exo2 text-gray-400">
        Historia zalogowanych posiłków
      </Text>
    </View>
  );

  if (!isAuthenticated) {
    return (
      <View 
        style={{ paddingTop: insets.top + 20 }} 
        className="flex-1 bg-raisin-black justify-center items-center"
      >
        <Text className="text-xl font-exo2-semibold text-gray-400">
          Musisz się zalogować
        </Text>
      </View>
    );
  }

  return (
    <View style={{ paddingTop: insets.top + 20 }} className="flex-1 bg-raisin-black">
      {loading && meals.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#f7438d" />
          <Text className="text-white font-exo2 mt-4">Ładowanie posiłków...</Text>
        </View>
      ) : (        <FlatList
          data={meals || []}
          keyExtractor={(item, index) => {
            // Ensure we always have a valid key
            if (item && item.id) {
              return String(item.id);
            }
            return `meal-${index}-${Date.now()}`;
          }}
          renderItem={({ item }) => {
            // Additional safety check in render
            if (!item || !item.id) {
              return null;
            }
            return <MealItem meal={item} />;
          }}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#f7438d"
              colors={['#f7438d']}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={meals.length === 0 ? { flex: 1 } : { paddingBottom: 20 }}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
      )}
    </View>
  );
};

export default MealsScreen;
