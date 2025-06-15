import React from 'react';
import { Text, View, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, Settings, User, Trophy, Calendar, Zap, Crown } from 'lucide-react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
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
      <SafeAreaView className="flex-1 bg-night justify-center items-center">
        <Text className="text-white text-lg font-exo2">Błąd ładowania profilu</Text>
      </SafeAreaView>
    );
  }

  const memberSince = new Date(user.createdAt).toLocaleDateString('pl-PL', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <SafeAreaView className="flex-1 bg-night">
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Hero Section with Gradient Background */}
        <Animated.View 
          entering={FadeIn.duration(600)}
          className="bg-brand-pink pt-8 pb-16 px-6 relative overflow-hidden"
        >
          {/* Decorative circles */}
          <View className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full" />
          <View className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full" />
          
          <View className="items-center">
            {/* Avatar with Premium Badge */}
            <View className="relative mb-4">
              <View className="w-28 h-28 rounded-full bg-white items-center justify-center shadow-2xl">
                <Text className="text-brand-pink text-3xl font-exo2-bold">
                  {user.firstName[0]}{user.lastName[0]}
                </Text>
              </View>
              {/* Premium badge */}
              <View className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2">
                <Crown size={16} color="#FFFFFF" strokeWidth={2.5} />
              </View>
            </View>
            
            <Text className="text-white text-2xl font-exo2-bold tracking-tight mb-1">
              {user.firstName} {user.lastName}
            </Text>
            <Text className="text-white/80 text-base font-exo2">@{user.username}</Text>
            <Text className="text-white/60 text-sm font-exo2 mt-1">
              Członek od {memberSince}
            </Text>
          </View>
        </Animated.View>

        {/* Stats Cards */}
        <Animated.View 
          entering={FadeInUp.delay(200).duration(600)}
          className="px-6 -mt-8 mb-6"
        >
          <View className="bg-raisin-black rounded-2xl p-6 border border-brand-pink/20 shadow-xl">
            <View className="flex-row justify-around">
              <View className="items-center">
                <View className="bg-brand-pink/20 p-3 rounded-full mb-2">
                  <Zap size={24} color="#f7438d" strokeWidth={2} />
                </View>
                <Text className="text-white text-xl font-exo2-bold">47</Text>
                <Text className="text-gray-400 text-sm font-exo2">Posiłki</Text>
              </View>
              
              <View className="w-px bg-gray-700 mx-4" />
              
              <View className="items-center">
                <View className="bg-green-500/20 p-3 rounded-full mb-2">
                  <Trophy size={24} color="#10B981" strokeWidth={2} />
                </View>
                <Text className="text-white text-xl font-exo2-bold">12</Text>
                <Text className="text-gray-400 text-sm font-exo2">Osiągnięcia</Text>
              </View>
              
              <View className="w-px bg-gray-700 mx-4" />
              
              <View className="items-center">
                <View className="bg-blue-500/20 p-3 rounded-full mb-2">
                  <Calendar size={24} color="#3B82F6" strokeWidth={2} />
                </View>
                <Text className="text-white text-xl font-exo2-bold">
                  {Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                </Text>
                <Text className="text-gray-400 text-sm font-exo2">Dni</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View 
          entering={FadeInUp.delay(400).duration(600)}
          className="px-6 mb-6"
        >
          <Text className="text-white text-xl font-exo2-bold mb-4 tracking-tight">Szybkie akcje</Text>
          
          <View className="space-y-3">
            <TouchableOpacity className="bg-raisin-black p-4 rounded-2xl border border-gray-700 active:bg-gray-800 transition-all">
              <View className="flex-row items-center">
                <View className="bg-blue-500/20 p-3 rounded-full mr-4">
                  <User size={20} color="#3B82F6" strokeWidth={2} />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-exo2-semibold text-base">Edytuj profil</Text>
                  <Text className="text-gray-400 text-sm font-exo2">Zmień swoje dane osobowe</Text>
                </View>
                <Text className="text-gray-500 font-exo2">›</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="bg-raisin-black p-4 rounded-2xl border border-gray-700 active:bg-gray-800 transition-all">
              <View className="flex-row items-center">
                <View className="bg-purple-500/20 p-3 rounded-full mr-4">
                  <Settings size={20} color="#8B5CF6" strokeWidth={2} />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-exo2-semibold text-base">Ustawienia</Text>
                  <Text className="text-gray-400 text-sm font-exo2">Preferencje i powiadomienia</Text>
                </View>
                <Text className="text-gray-500 font-exo2">›</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="bg-raisin-black p-4 rounded-2xl border border-gray-700 active:bg-gray-800 transition-all">
              <View className="flex-row items-center">
                <View className="bg-yellow-500/20 p-3 rounded-full mr-4">
                  <Trophy size={20} color="#EAB308" strokeWidth={2} />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-exo2-semibold text-base">Osiągnięcia</Text>
                  <Text className="text-gray-400 text-sm font-exo2">Zobacz swoje postępy</Text>
                </View>
                <Text className="text-gray-500 font-exo2">›</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Account Info */}
        <Animated.View 
          entering={FadeInUp.delay(600).duration(600)}
          className="px-6 mb-6"
        >
          <Text className="text-white text-xl font-exo2-bold mb-4 tracking-tight">Informacje o koncie</Text>
          
          <View className="bg-raisin-black rounded-2xl p-5 border border-gray-700">
            <View className="space-y-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-400 font-exo2">Email</Text>
                <Text className="text-white font-exo2">{user.email}</Text>
              </View>
              
              <View className="h-px bg-gray-700" />
              
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-400 font-exo2">Nazwa użytkownika</Text>
                <Text className="text-white font-exo2">@{user.username}</Text>
              </View>
              
              <View className="h-px bg-gray-700" />
              
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-400 font-exo2">Data rejestracji</Text>
                <Text className="text-white font-exo2">
                  {new Date(user.createdAt).toLocaleDateString('pl-PL')}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Logout Button */}
        <Animated.View 
          entering={FadeInUp.delay(800).duration(600)}
          className="px-6"
        >
          <TouchableOpacity
            className={`bg-red-500/20 border border-red-500/50 w-full py-4 rounded-2xl items-center ${
              isLoading ? 'opacity-50' : 'active:bg-red-500/30'
            }`}
            onPress={handleLogout}
            disabled={isLoading}
          >
            <View className="flex-row items-center">
              <LogOut size={20} color="#EF4444" strokeWidth={2} />
              <Text className="text-red-400 font-exo2-bold text-lg ml-2">
                {isLoading ? 'Wylogowywanie...' : 'Wyloguj się'}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;