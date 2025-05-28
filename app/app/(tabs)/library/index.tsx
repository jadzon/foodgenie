import { Link } from 'expo-router';
import { SearchX } from 'lucide-react-native';
import React from 'react';
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import foodImages from '../../../assets/food_images/foodImages';
import { Dish, DISHES_DATA, Ingredient } from '../../../data/dishes';

const DishItem = ({ item }: { item: Dish }) => {

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
  const sortedIngredients = [...item.ingredients].sort(
    (a,b)=> b.calories-a.calories
  )
  const topIngredients = sortedIngredients.slice(0, 2);
  const remainingCount = sortedIngredients.length - 2;
  return(
  <Link href={`/library/${item.id}`} asChild>
    <TouchableOpacity
      className="flex items-center bg-transparent  p-4 rounded-2xl mb-4 border-b-[1px] border-onyx active:bg-onyx/10 transition-all"
    >
      <View className='flex-row items-center'>
        <Image
          source={foodImages[item.mainImageKey]}
          className="w-20 h-20 rounded-xl mr-4"
          resizeMode="cover"
        />

      <View className="flex-1">
        <Text className="text-xl text-white font-exo2-semibold tracking-tight mb-1">{item.name}</Text>
        {topIngredients.map((ingredient, index) => (
          <Text className="font-exo2 text-gray-400 text-sm" key={index}>{ingredient.name}</Text>
        ))}

      </View>
      <View className='flex align-top items-start'>
        <Text className='font-exo2-semibold text-gray-400'>2 dni temu</Text>
        <Text className='font-exo2-semibold text-brand-pink'>
          {calculateTotalCalories(item.ingredients)} kcal
        </Text>
      </View>
      </View>
    </TouchableOpacity>
  </Link>
);
}
export default function LibraryListScreen() {
  const renderDish = ({ item }: { item: Dish }) => (<DishItem item={item} />);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-night">
      <View className="p-4 flex-1">
        <Text className="text-3xl text-white font-exo2-bold mb-6 mt-2 tracking-tighter px-1">Twoje Dania</Text>

        {DISHES_DATA.length > 0 ? (
          <FlatList
            data={DISHES_DATA as Dish[]}
            renderItem={renderDish}
            keyExtractor={item => item.id}
            className="w-full"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          <View className="flex-1 justify-center items-center opacity-70">
            <SearchX size={64} color="#f7438d" strokeWidth={1.5} className="mb-4" />
            <Text className="text-xl text-slate-300 font-exo2-semibold mb-1">Brak dań</Text>
            <Text className="text-center text-slate-400">Dodaj swoje pierwsze danie, aby je tu zobaczyć.</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}