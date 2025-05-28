import { Stack } from 'expo-router';
import React from 'react';

export default function LibraryStackLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Lista Dań',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[dishId]"
        options={{
          title: 'Szczegóły Dania',
        }}
      />
    </Stack>
  );
}