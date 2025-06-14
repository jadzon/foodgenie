import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Calendar, ChefHat, Zap } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useAuthStore from '../../store/authStore';

interface Ingredient {
  id: string;
  name: string;
  weight: number;
  calories: number;
}

interface MealDetails {
  id: string;
  name: string;
  ingredients: Ingredient[];
  totalWeight: number;
  totalCalories: number;
  createdAt: string;
  updatedAt: string;
}

const IngredientItem = ({ ingredient }: { ingredient: Ingredient }) => (
  <View className="bg-raisin-black/50 border border-brand-pink/10 rounded-xl p-4 mb-3">
    <View className="flex-row items-center justify-between">
      <View className="flex-1">        <Text className="text-lg font-exo2-semibold text-white mb-1">
          {ingredient.name || 'Nieznany składnik'}
        </Text>
        <View className="flex-row items-center">
          <ChefHat size={14} color="#9CA3AF" strokeWidth={1.5} />
          <Text className="text-sm text-gray-400 font-exo2 ml-1">
            {Number(ingredient.weight) || 0}g
          </Text>
        </View>
      </View>
      
      <View className="items-end">
        <View className="flex-row items-center">
          <Zap size={16} color="#f7438d" strokeWidth={1.5} />
          <Text className="text-lg font-exo2-semibold text-brand-pink ml-1">
            {Number(ingredient.calories) || 0}
          </Text>
        </View>
        <Text className="text-xs text-gray-500 font-exo2">kcal</Text>
      </View>
    </View>
  </View>
);

const MealDetailsScreen = () => {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [mealDetails, setMealDetails] = useState<MealDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const { getMealDetails, isAuthenticated } = useAuthStore();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const fetchMealDetails = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const details = await getMealDetails(id);
      setMealDetails(details);
    } catch (error: any) {
      console.error('Error fetching meal details:', error);
      Alert.alert('Błąd', 'Nie udało się pobrać szczegółów posiłku');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && id) {
      fetchMealDetails();
    }
  }, [isAuthenticated, id]);

  const handleGoBack = () => {
    router.back();
  };

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

  if (loading) {
    return (
      <View 
        style={{ paddingTop: insets.top + 20 }} 
        className="flex-1 bg-raisin-black justify-center items-center"
      >
        <ActivityIndicator size="large" color="#f7438d" />
        <Text className="text-white font-exo2 mt-4">Ładowanie szczegółów...</Text>
      </View>
    );
  }

  if (!mealDetails) {
    return (
      <View 
        style={{ paddingTop: insets.top + 20 }} 
        className="flex-1 bg-raisin-black justify-center items-center"
      >
        <Text className="text-xl font-exo2-semibold text-gray-400">
          Nie znaleziono posiłku
        </Text>
      </View>
    );
  }

  return (
    <View style={{ paddingTop: insets.top + 20 }} className="flex-1 bg-raisin-black">
      {/* Header */}
      <View className="flex-row items-center px-4 mb-6">
        <TouchableOpacity onPress={handleGoBack} className="mr-4">
          <ArrowLeft size={24} color="#f7438d" strokeWidth={2} />
        </TouchableOpacity>
        <Text className="text-2xl font-exo2-bold text-white flex-1">
          Szczegóły Posiłku
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Meal Info Card */}
        <View className="bg-raisin-black border border-brand-pink/30 rounded-2xl p-6 mx-4 mb-6">          <Text className="text-2xl font-exo2-bold text-white mb-4" numberOfLines={2}>
            {mealDetails.name || 'Nieznany posiłek'}
          </Text>
          
          <View className="flex-row items-center mb-4">
            <Calendar size={18} color="#9CA3AF" strokeWidth={1.5} />
            <Text className="text-base text-gray-400 font-exo2 ml-2">
              {formatDate(mealDetails.createdAt)}
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center bg-brand-pink/10 rounded-xl px-4 py-2">
              <ChefHat size={20} color="#f7438d" strokeWidth={1.5} />
              <Text className="text-lg font-exo2-semibold text-brand-pink ml-2">
                {Number(mealDetails.totalWeight) || 0}g
              </Text>
            </View>
            
            <View className="flex-row items-center bg-brand-pink/10 rounded-xl px-4 py-2">
              <Zap size={20} color="#f7438d" strokeWidth={1.5} />
              <Text className="text-lg font-exo2-semibold text-brand-pink ml-2">
                {Number(mealDetails.totalCalories) || 0} kcal
              </Text>
            </View>
          </View>
        </View>

        {/* Ingredients Section */}
        <View className="mx-4 mb-6">          <Text className="text-xl font-exo2-semibold text-white mb-4">
            Składniki ({mealDetails.ingredients?.length || 0})
          </Text>
          
          {mealDetails.ingredients.map((ingredient) => (
            <IngredientItem key={ingredient.id} ingredient={ingredient} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default MealDetailsScreen;
