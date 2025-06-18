import React from 'react';
import { Text, View, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, User, Calendar, Zap } from 'lucide-react-native';
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
          className="bg-brand-pink pt-8 pb-20 px-6 relative overflow-hidden"
        >
          {/* Subtle decorative elements */}
          <View className="absolute top-10 right-8 w-24 h-24 bg-white/10 rounded-full" />
          <View className="absolute bottom-8 left-4 w-16 h-16 bg-white/5 rounded-full" />
          <View className="absolute top-20 left-12 w-8 h-8 bg-white/15 rounded-full" />
          
          <View className="items-center">
            {/* Simple Avatar */}
            <View className="w-32 h-32 rounded-full bg-white items-center justify-center shadow-2xl mb-4 border-4 border-white/20">
              <Text className="text-brand-pink text-4xl font-exo2-bold">
                {user.firstName[0]}{user.lastName[0]}
              </Text>
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
          className="px-6 -mt-8 mb-8"
        >
          <View className="bg-raisin-black rounded-2xl p-6 border border-brand-pink/20 shadow-xl">
            <View className="flex-row justify-around">
              <View className="items-center flex-1">
                <View className="bg-brand-pink/20 p-4 rounded-2xl mb-3">
                  <Zap size={28} color="#f7438d" strokeWidth={2.5} />
                </View>
                <Text className="text-white text-2xl font-exo2-bold">{user.mealCount}</Text>
                <Text className="text-brand-pink text-base font-exo2-semibold">Posiłki</Text>
                <Text className="text-gray-400 text-xs font-exo2 mt-1">zeskanowane</Text>
              </View>
              
              <View className="w-px bg-brand-pink/30 mx-6" />
              
              <View className="items-center flex-1">
                <View className="bg-blue-500/20 p-4 rounded-2xl mb-3">
                  <Calendar size={28} color="#3B82F6" strokeWidth={2.5} />
                </View>
                <Text className="text-white text-2xl font-exo2-bold">
                  {Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                </Text>
                <Text className="text-blue-400 text-base font-exo2-semibold">Dni</Text>
                <Text className="text-gray-400 text-xs font-exo2 mt-1">z FoodGenie</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Quick Actions */}

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