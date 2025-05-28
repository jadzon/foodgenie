import { useFonts } from 'expo-font';
import { Stack, router, usePathname } from 'expo-router';
import { X as CloseIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native'; // StyleSheet removed
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Logo from "../assets/images/icon.png";
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
function LoginScreenComponent({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View className="flex-1 justify-center items-center pb-5 bg-raisin-black">
      <Image source={Logo} className="w-[200px] h-[200px] mb-5" resizeMode="contain" />
      <Text className="text-[38px] font-bold mb-2 text-brand-pink">FoodGenie</Text>
      <Text className="text-base mb-10 text-gray-400">Zaloguj się</Text>

      <View className="w-full px-8">
        <TextInput
          className="w-full h-14 bg-night text-white px-4 rounded-lg mb-5 border border-gray-700 text-base"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          className="w-full h-14 bg-night text-white px-4 rounded-lg mb-8 border border-gray-700 text-base"
          placeholder="Hasło"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#9CA3AF"
        />
        <TouchableOpacity
          className="bg-brand-pink w-full py-4 rounded-lg items-center shadow-lg active:opacity-80"
          onPress={() => onLogin(email, password)}
        >
          <Text className="text-white font-bold text-lg">Zaloguj się</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity className="mt-8">
        <Text className="text-brand-pink text-sm">Zapomniałeś hasła?</Text>
      </TouchableOpacity>
      <View className="flex-row mt-4">
        <Text className="text-gray-400 text-sm">Nie masz konta? </Text>
        <TouchableOpacity>
            <Text className="text-brand-pink text-sm font-semibold">Zarejestruj się</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [fontsLoaded] = useFonts({
      'Exo2': require('../assets/fonts/Exo2-Regular.ttf'),
      'Exo2-Bold': require('../assets/fonts/Exo2-Bold.ttf'),
      'Exo2-SemiBold': require('../assets/fonts/Exo2-SemiBold.ttf'),
      'Exo2-Italic': require('../assets/fonts/Exo2-Italic.ttf'),
    });

    if (!fontsLoaded) {
      return null;
    }


  const handleLogin = () => {
    console.log("Login attempt successful (dummy)");
    setIsAuthenticated(true);
  };

  // if (!isAuthenticated) {
  //   return <LoginScreenComponent onLogin={handleLogin} />;
  // }

  return (
    <View className="flex-1 bg-night font-exo2">
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="meal/[id]" options={{ headerShown: false }} />
        <Stack.Screen
          name="profile"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
      <ProfileOverlayIcon />
    </View>
  );
}
