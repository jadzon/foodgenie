import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, ImageOff, Zap } from 'lucide-react-native';
import React from 'react';
import { FlatList, Image, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import foodImages from '../../../assets/food_images/foodImages';
import { Dish, DISHES_DATA, Ingredient } from '../../../data/dishes';

const calculateTotalCalories = (ingredients: Ingredient[]): number => {
  return ingredients.reduce((total, ingredient) => {
    if (ingredient.calories) {
      const calValue = parseInt(String(ingredient.calories).replace(/[^0-9]/g, ''), 10);
      if (!isNaN(calValue)) {
        return total + calValue;
      }
    }
    return total;
  }, 0);
};

const IngredientItem = ({ item }: { item: Ingredient }) => (
  <View className="flex-row items-center p-4 border-b-[1] border-solid border-white bg-transparent">
    {item.imageKey && foodImages[item.imageKey] ? (
      <Image
        source={foodImages[item.imageKey]}
        className="w-16 h-16 rounded-lg mr-4"
        resizeMode="contain"
      />
    ) : (
      <View className="w-16 h-16 rounded-lg mr-4 justify-center items-center bg-raisin-black border border-brand-pink/30">
        <ImageOff size={30} color="#f7438d" strokeWidth={1.5} />
      </View>
    )}
    <View className="flex-1">
      <Text className="text-lg text-slate-50 font-exo2-semibold tracking-tight">{item.name}</Text>
      <View className="flex-row items-baseline mt-1.5">
        <Text className="text-sm text-slate-400 font-exo2">{item.amount}</Text>
          <View className="flex-row ml-3">
            <Text className="text-sm text-brand-pink font-exo2-semibold ml-1 ">
              {String(item.calories).replace(/[^0-9]/g, '')} kcal
            </Text>
          </View>
      </View>
    </View>
  </View>
);

export default function DishDetailScreen() {
  const { dishId } = useLocalSearchParams<{ dishId: string }>();
  const dish = DISHES_DATA.find((d) => d.id === dishId) as Dish | undefined;
  const insets = useSafeAreaInsets();

  if (!dish) {
    return (
      <View
        className="flex-1 bg-raisin-black justify-center items-center"
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
        <Text className="text-white text-xl">Nie znaleziono dania.</Text>
      </View>
    );
  }

  const totalCalories = calculateTotalCalories(dish.ingredients);
  const mainDishImageSource = dish.mainImageKey && foodImages[dish.mainImageKey]
    ? foodImages[dish.mainImageKey]
    : null;

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
                top:  0,
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
            <Image
              source={mainDishImageSource}
              className="w-60 h-60 md:w-64 md:h-64 mb-6"
              resizeMode="contain"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
              }}
            />
            </View>
        </Animated.View>

        {/* Karta z informacjami */}
        <View className="bg-night pt-8 pb-8 px-6 rounded-t-[50px] border-t border-brand-pink/20">
          <Text className="text-4xl text-white font-exo2-bold text-center tracking-tighter mb-4">
            {dish.name}
          </Text>
          <View className="flex-row justify-center items-center self-center py-2.5 px-6 mb-10 bg-raisin-black rounded-full border border-brand-pink">
            <Zap size={18} color="#f7438d" className="mr-2" strokeWidth={2.5} />
            <Text className="text-xl text-brand-pink font-exo2-bold tracking-tight">{totalCalories}</Text>
            <Text className="text-base text-brand-pink/90 ml-1.5 font-exo2-bold">kcal</Text>
          </View>

          <View className="mb-6">
            <Text className="text-2xl text-white font-exo2-bold mb-4 tracking-tight">Składniki</Text>
            <FlatList
              data={dish.ingredients}
              renderItem={({ item }) => <IngredientItem item={item} />}
              keyExtractor={(item, index) => `${dish.id}-ing-${item.name}-${index}`}
              scrollEnabled={false}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}