import { useFonts } from 'expo-font';
import { Stack, router, usePathname } from 'expo-router';
import { X as CloseIcon } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Image, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Logo from "../assets/images/icon.png";
import useAuthStore from '../store/authStore';
import './globals.css';

function ProfileOverlayIcon() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const isProfileScreen = pathname === '/profile';

  const handlePress = () => {
    if (isProfileScreen) {
      router.back();
    } else {
      router.push('/profile');
    }
  };
  const userProfileImageUrl = 'https://thispersondoesnotexist.com';
  const iconContainerStyle = {
    top: insets.top + 15,
    right: 15,
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="absolute z-10 shadow-lg"
      style={iconContainerStyle} 
      accessibilityLabel={isProfileScreen ? 'Close profile' : 'Open profile'}
    >
      {isProfileScreen ? (
        <View className="w-12 h-12 rounded-full items-center justify-center bg-[rgba(0,0,0,0.3)]">
          <CloseIcon color="#FFFFFF" size={28} strokeWidth={2} />
        </View>
      ) : (
        <Image
          source={{ uri: userProfileImageUrl }}
          className="w-12 h-12 rounded-full border border-[rgba(255,255,255,0.3)] bg-gray-400"
        />
      )}
    </TouchableOpacity>
  );
}

export default function RootLayout() {
  const { isAuthenticated, isLoading, checkAuthStatus } = useAuthStore();
  const [fontsLoaded] = useFonts({
      'Exo2': require('../assets/fonts/Exo2-Regular.ttf'),
      'Exo2-Bold': require('../assets/fonts/Exo2-Bold.ttf'),
      'Exo2-SemiBold': require('../assets/fonts/Exo2-SemiBold.ttf'),
      'Exo2-Italic': require('../assets/fonts/Exo2-Italic.ttf'),
    });

  useEffect(() => {
    // Check authentication status when app starts
    checkAuthStatus();
  }, []);

  // Show loading screen while checking auth status or loading fonts
  if (!fontsLoaded || isLoading) {
    return (
      <View className="flex-1 bg-raisin-black items-center justify-center">
        <Image source={Logo} className="w-[200px] h-[200px] mb-8" resizeMode="contain" />
        <ActivityIndicator size="large" color="#FF6B9D" />
        <Text className="text-white mt-4">Ładowanie...</Text>
      </View>
    );
  }

  // Show auth screens if not authenticated
  if (isAuthenticated === false) {
    return (
      <View className="flex-1 bg-night font-exo2">
        <Stack>
          <Stack.Screen name="auth" options={{ headerShown: false }} />
        </Stack>
      </View>
    );
  }
  // Show main app if authenticated
  return (
    <View className="flex-1 bg-night font-exo2">
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="profile"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
      </Stack>
      <ProfileOverlayIcon />
    </View>
  );
}
