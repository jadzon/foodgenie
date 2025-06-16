import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, ImageOff, Zap, Clock, Trash2 } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, ScrollView, StatusBar, Text, TouchableOpacity, View, ActivityIndicator, Image, Alert, Modal } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useAuthStore from '../../../store/authStore';
import { MEALS_URL } from '../../../config/config';
import foodImages from '../../../assets/food_images/foodImages';

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

// Function to get the correct food image key based on ingredient name
const getFoodImageKey = (ingredientName: string): string | null => {
  if (!ingredientName) return null;
  
  const name = ingredientName.toLowerCase().trim();
  
  // Create mapping from ingredient names to foodImages keys
  const nameToKeyMap: { [key: string]: string } = {
    // Exact matches first
    'apple': 'food.apple',
    'banana': 'food.banana', 
    'beef': 'food.beef',
    'blueberry': 'food.blueberry',
    'bread': 'food.bread',
    'bun': 'food.bun',
    'butter': 'food.butter',
    'carrot': 'food.carrot',
    'carrots': 'food.carrot',
    'cereal': 'food.cereal',
    'cheese': 'food.cheese',
    'chicken breast': 'food.chickenBreast',
    'chicken thigh': 'food.chickenThigh', 
    'chicken wing': 'food.chickenWing',
    'chicken': 'food.chicken',
    'chocolate': 'food.chocolate',
    'coffee': 'food.coffee',
    'cooking oil': 'food.cookingOil',
    'oil': 'food.cookingOil',
    'cottage cheese': 'food.cottageCheese',
    'cream': 'food.cream',
    'cucumber': 'food.cucumber',
    'egg': 'food.egg',
    'eggs': 'food.egg',
    'fish': 'food.fish',
    'flour': 'food.flour',
    'garlic': 'food.garlic',
    'honey': 'food.honey',
    'jam': 'food.jam',
    'juice': 'food.juice',
    'ketchup': 'food.ketchup',
    'lemon': 'food.lemon',
    'lettuce': 'food.lettuce',
    'mayonnaise': 'food.mayonnaise',
    'milk': 'food.milk',
    'mustard': 'food.mustard',
    'nuts': 'food.nut',
    'nut': 'food.nut',
    'olive oil': 'food.oliveOil',
    'onion': 'food.onion',
    'pasta': 'food.pasta',
    'pepper': 'food.pepper',
    'pork': 'food.pork',
    'potato': 'food.potato',
    'potatoes': 'food.potato',
    'radish': 'food.radish',
    'raspberry': 'food.raspberry',
    'raspberries': 'food.raspberry',
    'rice': 'food.rice',
    'sausage': 'food.sausage',
    'spice': 'food.spice',
    'strawberry': 'food.strawberry',
    'strawberries': 'food.strawberry',
    'sugar': 'food.sugar',
    'tomato': 'food.tomato',
    'tomatoes': 'food.tomato',
    'water': 'food.water',
    'yogurt': 'food.yoghurt',
    'yoghurt': 'food.yoghurt',
    'broccoli': 'food.brocoli',
    'brocoli': 'food.brocoli',
  };
  
  // Try exact match first
  if (nameToKeyMap[name]) {
    return nameToKeyMap[name];
  }
  
  // Try partial matches (if ingredient name contains any of these words)
  for (const [key, value] of Object.entries(nameToKeyMap)) {
    if (name.includes(key) || key.includes(name)) {
      return value;
    }
  }
  
  return null;
};

const IngredientItem = ({ item }: { item: any }) => {
  // Get the correct food image key
  const foodImageKey = getFoodImageKey(item.name);
  const foodImage = foodImageKey ? foodImages[foodImageKey] : null;

  return (
    <View className="flex-row items-center p-4 border-b-[1] border-solid border-white/10 bg-transparent">
      <View className="w-16 h-16 rounded-lg mr-4 justify-center items-center bg-raisin-black border border-brand-pink/30 overflow-hidden">
        {foodImage ? (
          <Image 
            source={foodImage} 
            className="w-12 h-12" 
            resizeMode="contain"
          />
        ) : (
          <ImageOff size={30} color="#f7438d" strokeWidth={1.5} />
        )}
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
};

export default function DishDetailScreen() {
  const { dishId } = useLocalSearchParams<{ dishId: string }>();
  const [meal, setMeal] = useState<ServerMealDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const insets = useSafeAreaInsets();

  const fetchMealDetails = useCallback(async () => {
    if (!dishId) return;

    try {
      setLoading(true);
      setError(null);
      
      const { accessToken } = useAuthStore.getState();
      
      if (!accessToken) {
        throw new Error('Brak autoryzacji');
      }

      const response = await fetch(`${MEALS_URL}/${dishId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Błąd serwera: ${response.status}`);
      }

      const data = await response.json();
      setMeal(data);
    } catch (error: any) {
      console.error('Error fetching meal details:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [dishId]);

  const deleteMeal = useCallback(async () => {
    if (!dishId) return;

    try {
      setDeleting(true);
      
      const { accessToken } = useAuthStore.getState();
      
      if (!accessToken) {
        throw new Error('Brak autoryzacji');
      }

      const response = await fetch(`${MEALS_URL}/${dishId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Błąd serwera: ${response.status}`);
      }

      // Successfully deleted, navigate back
      router.back();
    } catch (error: any) {
      console.error('Error deleting meal:', error);
      Alert.alert('Błąd', 'Nie udało się usunąć posiłku: ' + error.message);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }, [dishId]);

  const handleDeletePress = () => {
    setShowDeleteConfirm(true);
  };

  useEffect(() => {
    fetchMealDetails();
  }, [fetchMealDetails]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Dzisiaj';
    } else if (diffDays === 2) {
      return 'Wczoraj';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} dni temu`;
    } else {
      return date.toLocaleDateString('pl-PL', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    }
  };

  if (loading) {
    return (
      <View
        className="flex-1 bg-night justify-center items-center"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <Stack.Screen
          options={{
            title: 'Ładowanie...',
            headerShown: false,
          }}
        />
        <ActivityIndicator size="large" color="#f7438d" />
        <Text className="text-white text-lg font-exo2 mt-4">Ładowanie dania...</Text>
      </View>
    );
  }

  if (error || !meal) {
    return (
      <View
        className="flex-1 bg-night justify-center items-center px-6"
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
        <View className="bg-red-500/20 p-6 rounded-2xl mb-6 border border-red-500/30">
          <Text className="text-red-400 text-center font-exo2 text-lg">
            {error || 'Nie znaleziono dania'}
          </Text>
        </View>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="bg-brand-pink px-8 py-4 rounded-2xl"
        >
          <Text className="text-white font-exo2-bold text-lg">Wróć</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-brand-pink">
      <StatusBar barStyle="light-content" />
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      {/* Delete Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showDeleteConfirm}
        onRequestClose={() => setShowDeleteConfirm(false)}
        statusBarTranslucent={true}
      >
        <View className="flex-1 bg-black/70 justify-center items-center px-6">
          <Animated.View 
            entering={FadeIn.duration(300)}
            className="bg-raisin-black border border-red-500/30 rounded-3xl p-6 w-full max-w-sm"
          >
            <View className="items-center mb-6">
              <View className="bg-red-500/20 p-4 rounded-full mb-4">
                <Trash2 size={32} color="#EF4444" strokeWidth={2} />
              </View>
              <Text className="text-white text-xl font-exo2-bold mb-2 text-center">
                Usuń posiłek
              </Text>
              <Text className="text-gray-400 font-exo2 text-center">
                Czy na pewno chcesz usunąć "{meal?.name}"? Ta akcja jest nieodwracalna.
              </Text>
            </View>

            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 bg-gray-600/30 py-3 rounded-2xl items-center"
              >
                <Text className="text-gray-300 font-exo2-semibold text-base">
                  Anuluj
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={deleteMeal}
                disabled={deleting}
                className={`flex-1 bg-red-500 py-3 rounded-2xl items-center ${
                  deleting ? 'opacity-70' : ''
                }`}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white font-exo2-bold text-base">
                    Usuń
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        scrollEnabled={!showDeleteConfirm}
      >
        {/* Sekcja Hero */}
        <Animated.View
          entering={FadeIn.duration(700)}
          className="w-full items-center justify-end relative"
          style={{ paddingTop: insets.top + 60, minHeight: 320 }}
        >
          {/* Back button - moved here */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-12 left-4 bg-black/50 p-3 rounded-full active:bg-black/70 z-10"
          >
            <ChevronLeft size={24} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>

          {/* Date Badge */}
          <View className="absolute top-16 right-6 bg-black/60 rounded-full px-4 py-2 flex-row items-center">
            <Clock size={16} color="#FFFFFF" strokeWidth={2} />
            <Text className="text-white font-exo2-semibold text-sm ml-2">
              {formatDate(meal.createdAt)}
            </Text>
          </View>

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
          
          {/* Stats Section - New Design */}
          <View className="bg-gradient-to-r from-raisin-black to-night rounded-3xl p-6 mb-8 border border-brand-pink/10">
            {/* Top Row - Main Stats */}
            <View className="flex-row justify-between mb-6">
              <View className="items-start">
                <Text className="text-brand-pink font-exo2-bold text-6xl">{meal.totalCalories}</Text>
                <Text className="text-white font-exo2-semibold text-base mt-1">KALORIE</Text>
              </View>
              <View className="items-end">
                <Text className="text-green-400 font-exo2-bold text-4xl">{meal.totalWeight}</Text>
                <Text className="text-white font-exo2-semibold text-base mt-1">GRAM</Text>
              </View>
            </View>

            {/* Separator Line */}
            <View className="h-px bg-brand-pink/20 mb-6" />

            {/* Bottom Row - Additional Info */}
            <View className="flex-row justify-between">
              <View className="items-center bg-brand-pink/10 rounded-2xl px-4 py-3">
                <Text className="text-brand-pink font-exo2-bold text-lg">
                  {Math.round((meal.totalCalories / meal.totalWeight) * 100) / 100}
                </Text>
                <Text className="text-gray-300 font-exo2 text-xs">kcal/100g</Text>
              </View>
              
              <View className="items-center bg-orange-500/10 rounded-2xl px-4 py-3">
                <Text className="text-orange-400 font-exo2-bold text-lg">{meal.ingredients.length}</Text>
                <Text className="text-gray-300 font-exo2 text-xs">składników</Text>
              </View>
              
              <View className="items-center bg-blue-500/10 rounded-2xl px-4 py-3">
                <Text className="text-blue-400 font-exo2-bold text-lg">AI</Text>
                <Text className="text-gray-300 font-exo2 text-xs">analiza</Text>
              </View>
            </View>
          </View>

          {/* Ingredients Section */}
          <View className="mb-6">
            <Text className="text-2xl text-white font-exo2-bold mb-4 tracking-tight">
              Składniki ({meal.ingredients.length})
            </Text>
            <FlatList
              data={meal.ingredients}
              renderItem={({ item }) => <IngredientItem item={item} />}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>

          {/* Additional Info */}
          <View className="bg-raisin-black/30 rounded-2xl p-4 mb-6">
            <Text className="text-gray-400 font-exo2 text-sm text-center mb-2">
              Analiza AI • {formatDate(meal.createdAt)}
            </Text>
            <Text className="text-gray-500 font-exo2 text-xs text-center">
              ID: {meal.id.split('-')[0]}...
            </Text>
          </View>

          {/* Delete Section */}
          <View className="mb-6">
            <TouchableOpacity
              onPress={handleDeletePress}
              disabled={deleting}
              className={`bg-red-500/20 border border-red-500/50 w-full py-4 rounded-2xl items-center ${
                deleting ? 'opacity-50' : 'active:bg-red-500/30'
              }`}
            >
              <View className="flex-row items-center">
                {deleting ? (
                  <>
                    <ActivityIndicator size={20} color="#EF4444" />
                    <Text className="text-red-400 font-exo2-bold text-lg ml-2">
                      Usuwanie...
                    </Text>
                  </>
                ) : (
                  <>
                    <Trash2 size={20} color="#EF4444" strokeWidth={2} />
                    <Text className="text-red-400 font-exo2-bold text-lg ml-2">
                      Usuń posiłek
                    </Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}