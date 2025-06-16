import { router } from 'expo-router';
import { Eye, EyeOff, Lock, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAuthStore from '../../store/authStore';
import Logo from "../../assets/images/icon.png";

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAuthStore();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Błąd', 'Proszę wypełnić wszystkie pola');
      return;
    }

    try {
      clearError();
      await login({ username: username.trim(), password });
    } catch (error) {
      const errorMessage =
        typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message?: string }).message)
          : 'Wystąpił błąd podczas logowania';
      Alert.alert('Błąd logowania', errorMessage);
    }
  };

  const goToRegister = () => {
    router.push('auth/register');
  };

  return (
    <SafeAreaView className="flex-1 bg-night">
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-1 justify-center px-6 py-8">
              {/* Logo Section */}
              <Animated.View 
                entering={FadeInDown.delay(100).duration(600)}
                className="items-center mb-12"
              >
                <Image source={Logo} className="w-32 h-32 mb-6" resizeMode="contain" />
                <Text className="text-3xl font-exo2-bold text-brand-pink mb-2 tracking-tight">
                  FoodGenie
                </Text>
                <Text className="text-base font-exo2 text-gray-400 text-center">
                  Zaloguj się do swojego konta
                </Text>
              </Animated.View>

              {/* Error Message */}
              {error && (
                <Animated.View 
                  entering={FadeInUp.duration(400)}
                  className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl"
                >
                  <Text className="text-red-400 text-center font-exo2">{error}</Text>
                </Animated.View>
              )}

              {/* Login Form */}
              <Animated.View 
                entering={FadeInUp.delay(200).duration(600)}
                className="mb-8"
              >
                {/* Username Input */}
                <View className="relative mb-4">
                  <View className="absolute left-4 top-4 z-10">
                    <User size={20} color="#9CA3AF" strokeWidth={2} />
                  </View>
                  <TextInput
                    className="w-full h-14 bg-raisin-black text-white pl-12 pr-4 rounded-2xl border border-brand-pink/30 text-base font-exo2"
                    placeholder="Nazwa użytkownika"
                    value={username}
                    onChangeText={setUsername}
                    placeholderTextColor="#6B7280"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                </View>
                
                {/* Password Input */}
                <View className="relative mb-6">
                  <View className="absolute left-4 top-4 z-10">
                    <Lock size={20} color="#9CA3AF" strokeWidth={2} />
                  </View>
                  <TextInput
                    className="w-full h-14 bg-raisin-black text-white pl-12 pr-12 rounded-2xl border border-brand-pink/30 text-base font-exo2"
                    placeholder="Hasło"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    placeholderTextColor="#6B7280"
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4"
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="#9CA3AF" strokeWidth={2} />
                    ) : (
                      <Eye size={20} color="#9CA3AF" strokeWidth={2} />
                    )}
                  </TouchableOpacity>
                </View>
                
                {/* Login Button */}
                <TouchableOpacity
                  className={`bg-brand-pink w-full py-4 rounded-2xl items-center shadow-lg ${
                    isLoading ? 'opacity-70' : 'active:opacity-90'
                  }`}
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  <Text className="text-white font-exo2-bold text-lg">
                    {isLoading ? 'Logowanie...' : 'Zaloguj się'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Footer Links */}
              <Animated.View 
                entering={FadeInUp.delay(400).duration(600)}
                className="items-center space-y-4"
              >
                <TouchableOpacity>
                  <Text className="text-brand-pink text-sm font-exo2">
                    Zapomniałeś hasła?
                  </Text>
                </TouchableOpacity>
                
                <View className="flex-row items-center">
                  <Text className="text-gray-400 text-sm font-exo2">Nie masz konta? </Text>
                  <TouchableOpacity onPress={goToRegister} disabled={isLoading}>
                    <Text className="text-brand-pink text-sm font-exo2-semibold">
                      Zarejestruj się
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}