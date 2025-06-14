import React from 'react';
import { Text, View, TouchableOpacity, Image, Alert } from 'react-native';
import useAuthStore from '../store/authStore';

const Profile = () => {
  const { user, logout, isLoading } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Wylogowanie',
      'Czy na pewno chcesz się wylogować?',
      [
        {
          text: 'Anuluj',
          style: 'cancel',
        },
        {
          text: 'Wyloguj',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  if (!user) {
    return (
      <View className="flex-1 bg-raisin-black justify-center items-center p-8">
        <Text className="text-white text-lg">Błąd ładowania profilu</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-raisin-black p-8 pt-20">
      <View className="items-center mb-8">
        <View className="w-32 h-32 rounded-full bg-brand-pink items-center justify-center mb-4">
          <Text className="text-white text-4xl font-bold">
            {user.firstName[0]}{user.lastName[0]}
          </Text>
        </View>
        <Text className="text-white text-2xl font-bold">
          {user.firstName} {user.lastName}
        </Text>
        <Text className="text-gray-400 text-lg">@{user.username}</Text>
        <Text className="text-gray-400">{user.email}</Text>
      </View>

      <View className="space-y-4">
        <View className="bg-night p-4 rounded-lg">
          <Text className="text-gray-400 text-sm">Imię i nazwisko</Text>
          <Text className="text-white text-lg">
            {user.firstName} {user.lastName}
          </Text>
        </View>

        <View className="bg-night p-4 rounded-lg">
          <Text className="text-gray-400 text-sm">Nazwa użytkownika</Text>
          <Text className="text-white text-lg">@{user.username}</Text>
        </View>

        <View className="bg-night p-4 rounded-lg">
          <Text className="text-gray-400 text-sm">Email</Text>
          <Text className="text-white text-lg">{user.email}</Text>
        </View>

        <View className="bg-night p-4 rounded-lg">
          <Text className="text-gray-400 text-sm">Data rejestracji</Text>
          <Text className="text-white text-lg">
            {new Date(user.createdAt).toLocaleDateString('pl-PL')}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        className={`bg-red-500 w-full py-4 rounded-lg items-center mt-8 ${
          isLoading ? 'opacity-50' : 'active:opacity-80'
        }`}
        onPress={handleLogout}
        disabled={isLoading}
      >
        <Text className="text-white font-bold text-lg">
          {isLoading ? 'Wylogowywanie...' : 'Wyloguj się'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Profile;