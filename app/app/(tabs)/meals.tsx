import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MealsScreen() {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-night">
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-3xl text-white font-exo2-bold mb-4 text-center">
          Meals Screen
        </Text>
        <Text className="text-slate-400 text-center font-exo2">
          This screen is under development
        </Text>
      </View>
    </SafeAreaView>
  );
}
