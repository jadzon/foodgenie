import { Link } from 'expo-router';
import { SearchX } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { 
  FlatList, 
  Image, 
  Text, 
  TouchableOpacity, 
  View, 
  ActivityIndicator, 
  Alert,
  RefreshControl,
  Dimensions
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  useSharedValue, 
  withRepeat, 
  withTiming, 
  useAnimatedStyle,
  interpolate,
  Easing
} from 'react-native-reanimated';
import { api } from '../../../utils/httpClient';
import useAuthStore from '../../../store/authStore';

const { width } = Dimensions.get('window');

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

// Komponent Skeleton Loading dla pojedynczego dania
const DishItemSkeleton = ({ index }: { index: number }) => {
  const shimmerValue = useSharedValue(0);

  React.useEffect(() => {
    shimmerValue.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.ease }),
      -1,
      true
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(shimmerValue.value, [0, 1], [0.3, 0.7]);
    return { opacity };
  });

  return (
    <Animated.View 
      entering={FadeInDown.delay(index * 100).duration(400)}
      className="bg-transparent p-4 rounded-2xl mb-4 border-b-[1px] border-onyx"
    >
      <View className='flex-row items-center'>
        {/* Avatar skeleton */}
        <Animated.View 
          style={shimmerStyle}
          className="w-20 h-20 rounded-xl mr-4 bg-gray-700"
        />

        {/* Content skeleton */}
        <View className="flex-1">
          <Animated.View 
            style={shimmerStyle}
            className="h-6 bg-gray-700 rounded-lg mb-2 w-3/4"
          />
          <Animated.View 
            style={shimmerStyle}
            className="h-4 bg-gray-600 rounded-md mb-1 w-1/2"
          />
          <Animated.View 
            style={shimmerStyle}
            className="h-4 bg-gray-600 rounded-md w-2/3"
          />
        </View>

        {/* Right side skeleton */}
        <View className='flex items-end'>
          <Animated.View 
            style={shimmerStyle}
            className="h-4 bg-gray-600 rounded-md mb-2 w-20"
          />
          <Animated.View 
            style={shimmerStyle}
            className="h-5 bg-brand-pink/30 rounded-lg w-16"
          />
        </View>
      </View>
    </Animated.View>
  );
};

// Komponent z listą skeleton items
const SkeletonList = () => {
  return (
    <View className="px-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <DishItemSkeleton key={`skeleton-${index}`} index={index} />
      ))}
    </View>
  );
};

// Główny komponent dania
const DishItem = ({ item, index }: { item: ServerMeal; index: number }) => {
  if (!item || !item.id) return null;

  const topIngredients = item.ingredients?.slice(0, 2) || [];

  return (
    <Animated.View 
      entering={FadeInDown.delay(index * 50).duration(400)}
    >
      <Link href={`/library/${item.id}`} asChild>
        <TouchableOpacity className="flex items-center bg-transparent p-4 rounded-2xl mb-4 border-b-[1px] border-onyx active:bg-onyx/10 transition-all">
          <View className='flex-row items-center'>
            <View className="w-20 h-20 rounded-xl mr-4 bg-gray-700 flex items-center justify-center">
              <Text className="text-white text-2xl">🍽️</Text>
            </View>

            <View className="flex-1">
              <Text className="text-xl text-white font-exo2-semibold tracking-tight mb-1">
                {item?.name || 'Nieznane danie'}
              </Text>
              {topIngredients.map((ingredient, ingredientIndex) => (
                <Text 
                  className="font-exo2 text-gray-400 text-sm" 
                  key={`ingredient-${ingredientIndex}-${ingredient?.name || 'unknown'}`}
                >
                  {ingredient?.name || ''}
                </Text>
              ))}
            </View>

            <View className='flex align-top items-end'>
              <Text className='font-exo2-semibold text-gray-400 text-sm mb-1'>
                {new Date(item.createdAt).toLocaleDateString('pl-PL')}
              </Text>
              <View className="bg-brand-pink/20 px-3 py-1 rounded-full">
                <Text className='font-exo2-bold text-brand-pink text-sm'>
                  {item.totalCalories} kcal
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Link>
    </Animated.View>
  );
};



export default function LibraryListScreen() {
  const [meals, setMeals] = useState<ServerMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { isAuthenticated } = useAuthStore();

  const fetchMeals = useCallback(async (isRefresh = false) => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      console.log('Fetching meals using new HTTP client...');
      
      // Dodajemy małe opóźnienie dla pull-to-refresh żeby user zobaczył animację
      if (isRefresh) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Używamy nowego API clienta - automatycznie obsługuje odświeżanie tokenów
      const data = await api.meals.list(1);
      console.log('Meals response:', data);
      setMeals(data?.meals || []);
    } catch (error: any) {
      console.error('Error fetching meals:', error);
      
      if (isRefresh) {
        // Dla pull-to-refresh pokazujemy mniej inwazyjny błąd
        Alert.alert('Błąd odświeżania', 'Nie udało się odświeżyć listy dań');
      } else {
        Alert.alert('Błąd', 'Nie udało się pobrać listy dań: ' + error.message);
      }
      
      // Zachowaj poprzednie dane przy błędzie odświeżania
      if (!isRefresh) {
        setMeals([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated]);

  const onRefresh = useCallback(() => {
    fetchMeals(true);
  }, [fetchMeals]);

  useEffect(() => {
    fetchMeals(false);
  }, [fetchMeals]);

  const renderDish = ({ item, index }: { item: ServerMeal; index: number }) => {
    if (!item || !item.id) return null;
    return <DishItem item={item} index={index} />;
  };

  const renderEmptyState = () => (
    <Animated.View 
      entering={FadeIn.delay(300).duration(600)}
      className="flex-1 justify-center items-center opacity-70 px-8"
    >
      <SearchX size={64} color="#f7438d" strokeWidth={1.5} className="mb-4" />
      <Text className="text-xl text-slate-300 font-exo2-semibold mb-1 text-center">
        Brak dań
      </Text>
      <Text className="text-center text-slate-400 font-exo2">
        Zeskanuj swoje pierwsze danie, aby je tu zobaczyć.
      </Text>
      <TouchableOpacity 
        onPress={() => fetchMeals(false)}
        className="bg-brand-pink/20 border border-brand-pink/50 px-6 py-3 rounded-2xl mt-6"
      >
        <Text className="text-brand-pink font-exo2-semibold">
          Spróbuj ponownie
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderHeader = () => (
    <Animated.View 
      entering={FadeInDown.duration(600)}
      className="px-1 mb-4"
    >
      <Text className="text-3xl text-white font-exo2-bold mb-2 tracking-tighter">
        Twoje Dania
      </Text>
      <Text className="text-gray-400 font-exo2">
        Pociągnij w dół aby odświeżyć
      </Text>
    </Animated.View>
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-night">
      <View className="p-4 flex-1">
        {/* Header - zawsze widoczny */}
        {renderHeader()}
        
        {/* Loading state - skeleton */}
        {loading && !refreshing ? (
          <SkeletonList />
        ) : (
          <>
            {/* Lista dań lub empty state */}
            {meals && meals.length > 0 ? (
              <FlatList
                data={meals}
                renderItem={renderDish}
                keyExtractor={item => String(item?.id || Math.random())}
                className="w-full"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor="#f7438d" // iOS
                    colors={['#f7438d']} // Android
                    progressBackgroundColor="#25242A" // Android
                    title="Pociągnij aby odświeżyć" // iOS
                    titleColor="#f7438d" // iOS
                  />
                }
                // Dodatkowa animacja przy wejściu
                onLayout={() => {
                  // Można dodać dodatkowe animacje tutaj
                }}
              />
            ) : (
              renderEmptyState()
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}