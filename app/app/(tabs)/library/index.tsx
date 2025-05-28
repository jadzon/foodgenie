import { Link } from 'expo-router';
import { ChevronRight, SearchX, Utensils } from 'lucide-react-native';
import React from 'react';
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import foodImages from '../../../assets/food_images/foodImages';
import { DISHES_DATA, Dish } from '../../../data/dishes';

const DishItem = ({ item }: { item: Dish }) => (
  <Link href={`/library/${item.id}`} asChild>
    <TouchableOpacity
      className="flex-row items-center bg-raisin-black p-4 rounded-2xl mb-3.5 border border-transparent active:border-brand-pink/60 active:bg-slate-800/30 transition-all"
    >
      {item.mainImageKey && foodImages[item.mainImageKey] ? (
        <Image
          source={foodImages[item.mainImageKey]}
          className="w-20 h-20 rounded-xl mr-4"
          resizeMode="cover"
        />
      ) : (
        <View className="w-20 h-20 rounded-xl mr-4 bg-raisin-black border border-slate-700 justify-center items-center">
          <Utensils size={30} color="#f7438d" strokeWidth={1.5} />
        </View>
      )}

      <View className="flex-1">
        <Text className="text-xl text-white font-bold tracking-tight mb-1">{item.name}</Text>
      </View>
      <ChevronRight size={26} color="#f7438d" strokeWidth={2.5} className="opacity-70" />
    </TouchableOpacity>
  </Link>
);

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