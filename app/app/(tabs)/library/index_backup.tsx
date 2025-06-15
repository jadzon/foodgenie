import React from 'react';
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dish, DISHES_DATA } from '../../../data/dishes';

console.log('Library Index - DISHES_DATA:', DISHES_DATA);
console.log('Library Index - DISHES_DATA length:', DISHES_DATA?.length);

const DishItem = ({ item }: { item: Dish }) => {
  return (
    <View className="p-4 bg-gray-800 mb-2 rounded">
      <Text className="text-white text-lg">{item?.name || 'Unknown dish'}</Text>
      <Text className="text-gray-400">ID: {item?.id}</Text>
    </View>
  );
};

export default function LibraryListScreen() {
  const renderDish = ({ item }: { item: Dish }) => {
    return <DishItem item={item} />;
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-night">
      <View className="p-4 flex-1">
        <Text className="text-3xl text-white font-exo2-bold mb-6 mt-2 tracking-tighter px-1">
          Twoje Dania
        </Text>
        <Text className="text-white mb-2">DISHES_DATA length: {DISHES_DATA?.length || 'undefined'}</Text>
        <Text className="text-white mb-4">Type: {typeof DISHES_DATA}</Text>
        
        <FlatList
          data={DISHES_DATA || []}
          renderItem={renderDish}
          keyExtractor={item => String(item?.id || Math.random())}
          className="w-full"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={() => (
            <View className="p-8">
              <Text className="text-xl text-slate-300 font-exo2-semibold mb-1">
                Brak dań
              </Text>
              <Text className="text-center text-slate-400">
                No dishes found. Raw length: {DISHES_DATA?.length || 'undefined'}
              </Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
