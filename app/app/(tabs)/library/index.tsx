import { Link } from 'expo-router';
import { SearchX } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import foodImages from '../../../assets/food_images/foodImages';
import useAuthStore from '../../../store/authStore';
import { MEALS_URL } from '../../../config/config';

interface ServerMeal {
  id: string;
  name: string;
  totalCalories: number;
  totalWeight: number;
  createdAt: string;
  ingredients: Array<{
    id: string;
    name: string;
    weight: number;
    calories: number;
  }>;
}

const DishItem = ({ item }: { item: ServerMeal }) => {
  if (!item || !item.id) return null;

  const topIngredients = item.ingredients?.slice(0, 2) || [];

  return (
    <Link href={`/library/${item.id}`} asChild>
      <TouchableOpacity className="flex items-center bg-transparent p-4 rounded-2xl mb-4 border-b-[1px] border-onyx active:bg-onyx/10 transition-all">
        <View className='flex-row items-center'>
          <View className="w-20 h-20 rounded-xl mr-4 bg-gray-700 flex items-center justify-center">
            <Text className="text-white text-xs">🍽️</Text>
          </View>

          <View className="flex-1">
            <Text className="text-xl text-white font-exo2-semibold tracking-tight mb-1">
              {item?.name || 'Nieznane danie'}
            </Text>
            {topIngredients.map((ingredient, index) => (
              <Text 
                className="font-exo2 text-gray-400 text-sm" 
                key={`ingredient-${index}-${ingredient?.name || 'unknown'}`}
              >
                {ingredient?.name || ''}
              </Text>
            ))}
          </View>

          <View className='flex align-top items-start'>
            <Text className='font-exo2-semibold text-gray-400'>
              {new Date(item.createdAt).toLocaleDateString('pl-PL')}
            </Text>
            <Text className='font-exo2-semibold text-brand-pink'>
              {item.totalCalories} kcal
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

export default function LibraryListScreen() {
  const [meals, setMeals] = useState<ServerMeal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMeals = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching meals directly...');
      
      // Get access token directly from store without subscribing
      const { accessToken } = useAuthStore.getState();
      
      if (!accessToken) {
        console.error('No access token available');
        setMeals([]);
        return;
      }      // Make direct API call without using store's getMeals method
      const response = await fetch(`${MEALS_URL}?page=1`, {
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
      console.log('Meals response:', data);
      setMeals(data?.meals || []);
    } catch (error) {
      console.error('Error fetching meals:', error);
      setMeals([]);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  const renderDish = ({ item }: { item: ServerMeal }) => {
    if (!item || !item.id) return null;
    return <DishItem item={item} />;
  };
  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-night">
      <View className="p-4 flex-1">
        <Text className="text-3xl text-white font-exo2-bold mb-6 mt-2 tracking-tighter px-1">
          Twoje Dania
        </Text>
        
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-white">Ładowanie dań...</Text>
          </View>
        ) : meals && meals.length > 0 ? (
          <FlatList
            data={meals}
            renderItem={renderDish}
            keyExtractor={item => String(item?.id || Math.random())}
            className="w-full"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          <View className="flex-1 justify-center items-center opacity-70">
            <SearchX size={64} color="#f7438d" strokeWidth={1.5} className="mb-4" />
            <Text className="text-xl text-slate-300 font-exo2-semibold mb-1">
              Brak dań
            </Text>
            <Text className="text-center text-slate-400">
              Zeskanuj swoje pierwsze danie, aby je tu zobaczyć.
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}