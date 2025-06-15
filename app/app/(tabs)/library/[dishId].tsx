import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, ImageOff, Zap } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import foodImages from '../../../assets/food_images/foodImages';
import useAuthStore from '../../../store/authStore';
import { MEALS_URL } from '../../../config/config';

interface ServerMealDetails {
  id: string;
  name: string;
  totalCalories: number;
  totalWeight: number;
  createdAt: string;
  updatedAt: string;
  ingredients: Array<{
    id: string;
    name: string;
    weight: number;
    calories: number;
  }>;
}

const IngredientItem = ({ item }: { item: any }) => (
  <View className="flex-row items-center p-4 border-b-[1] border-solid border-white bg-transparent">
    <View className="w-16 h-16 rounded-lg mr-4 justify-center items-center bg-raisin-black border border-brand-pink/30">
      <ImageOff size={30} color="#f7438d" strokeWidth={1.5} />
    </View>
    <View className="flex-1">
      <Text className="text-lg text-slate-50 font-exo2-semibold tracking-tight">{item.name}</Text>
      <View className="flex-row items-baseline mt-1.5">
        <Text className="text-sm text-slate-400 font-exo2">{item.weight}g</Text>
        <View className="flex-row ml-3">
          <Text className="text-sm text-brand-pink font-exo2-semibold ml-1">
            {item.calories} kcal
          </Text>
        </View>
      </View>
    </View>
  </View>
);

export default function DishDetailScreen() {
  const { dishId } = useLocalSearchParams<{ dishId: string }>();
  const [meal, setMeal] = useState<ServerMealDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const fetchMealDetails = useCallback(async () => {
    if (!dishId) return;

    try {
      setLoading(true);
      setError(null);
      console.log('Fetching meal details for ID:', dishId);
      
      // Get access token directly from store
      const { accessToken } = useAuthStore.getState();
      
      if (!accessToken) {
        throw new Error('No access token available');
      }      // Make direct API call to get meal details
      const response = await fetch(`${MEALS_URL}/${dishId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Meal details response:', data);
      setMeal(data);
    } catch (error: any) {
      console.error('Error fetching meal details:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [dishId]);

  useEffect(() => {
    fetchMealDetails();
  }, [fetchMealDetails]);  if (loading) {
    return (
      <View
        className="flex-1 bg-night justify-center items-center"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <Stack.Screen
          options={{
            title: 'Ładowanie...',
            headerTransparent: false,
            headerStyle: { backgroundColor: '#25242A' },
            headerTintColor: '#f7438d',
          }}
        />
        <Text className="text-white text-xl">Ładowanie dania...</Text>
      </View>
    );
  }

  if (error || !meal) {
    return (
      <View
        className="flex-1 bg-night justify-center items-center"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <Stack.Screen
          options={{
            title: 'Błąd',
            headerTransparent: false,
            headerStyle: { backgroundColor: '#25242A' },
            headerTintColor: '#f7438d',
          }}
        />
        <Text className="text-white text-xl">
          {error || 'Nie znaleziono dania.'}
        </Text>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mt-4 bg-brand-pink px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-exo2-semibold">Wróć</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-brand-pink">
      <StatusBar barStyle="light-content" />
      <Stack.Screen
        options={{
          headerTransparent: true,
          headerTitle: '',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                position: 'absolute',
                top: 0,
                left: 0, 
                zIndex: 1, 
              }}
              className="bg-black/50 p-2 rounded-full active:bg-black/70"
            >
              <ChevronLeft size={26} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        {/* Sekcja Hero */}
        <Animated.View
          entering={FadeIn.duration(700)}
          className="w-full items-center justify-end relative"
          style={{ paddingTop: insets.top + 60, minHeight: 320 }}
        >
          <View className='p-6 rounded-full overflow-hidden bg-white w-80 h-80 mb-8 flex items-center align-center'>
            <View className="w-60 h-60 md:w-64 md:h-64 mb-6 justify-center items-center bg-gray-200 rounded-lg">
              <Text className="text-6xl">🍽️</Text>
            </View>
          </View>
        </Animated.View>

        {/* Karta z informacjami */}
        <View className="bg-night pt-8 pb-8 px-6 rounded-t-[50px] border-t border-brand-pink/20">
          <Text className="text-4xl text-white font-exo2-bold text-center tracking-tighter mb-4">
            {meal.name}
          </Text>
          <View className="flex-row justify-center items-center self-center py-2.5 px-6 mb-10 bg-raisin-black rounded-full border border-brand-pink">
            <Zap size={18} color="#f7438d" className="mr-2" strokeWidth={2.5} />
            <Text className="text-xl text-brand-pink font-exo2-bold tracking-tight">{meal.totalCalories}</Text>
            <Text className="text-base text-brand-pink/90 ml-1.5 font-exo2-bold">kcal</Text>
          </View>

          {/* Total Weight */}
          <View className="flex-row justify-center items-center self-center py-2 px-4 mb-6 bg-raisin-black/50 rounded-full">
            <Text className="text-lg text-white font-exo2-semibold">{meal.totalWeight}g</Text>
            <Text className="text-sm text-slate-400 ml-2">całkowita waga</Text>
          </View>

          <View className="mb-6">
            <Text className="text-2xl text-white font-exo2-bold mb-4 tracking-tight">Składniki</Text>
            <FlatList
              data={meal.ingredients}
              renderItem={({ item }) => <IngredientItem item={item} />}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>

          {/* Created Date */}
          <View className="mt-4 p-4 bg-raisin-black/30 rounded-lg">
            <Text className="text-slate-400 text-center">
              Utworzono: {new Date(meal.createdAt).toLocaleDateString('pl-PL')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}