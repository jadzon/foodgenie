import { router } from 'expo-router';
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
  ScrollView
} from 'react-native';
import useAuthStore from '../../store/authStore';
import Logo from "../../assets/images/icon.png";

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
    router.push('/auth/register');
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-raisin-black" 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center items-center px-8 py-12">
          <Image source={Logo} className="w-[200px] h-[200px] mb-8" resizeMode="contain" />
          
          <Text className="text-[38px] font-bold mb-2 text-brand-pink">FoodGenie</Text>
          <Text className="text-base mb-10 text-gray-400">Zaloguj się do swojego konta</Text>

          {error && (
            <View className="w-full mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg">
              <Text className="text-red-400 text-center">{error}</Text>
            </View>
          )}

          <View className="w-full space-y-4">
            <TextInput
              className="w-full h-14 bg-night text-white px-4 rounded-lg border border-gray-700 text-base"
              placeholder="Nazwa użytkownika"
              value={username}
              onChangeText={setUsername}
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            
            <TextInput
              className="w-full h-14 bg-night text-white px-4 rounded-lg border border-gray-700 text-base"
              placeholder="Hasło"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#9CA3AF"
              editable={!isLoading}
            />
            
            <TouchableOpacity
              className={`bg-brand-pink w-full py-4 rounded-lg items-center shadow-lg ${
                isLoading ? 'opacity-50' : 'active:opacity-80'
              }`}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text className="text-white font-bold text-lg">
                {isLoading ? 'Logowanie...' : 'Zaloguj się'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity className="mt-8">
            <Text className="text-brand-pink text-sm">Zapomniałeś hasła?</Text>
          </TouchableOpacity>
          
          <View className="flex-row mt-4">
            <Text className="text-gray-400 text-sm">Nie masz konta? </Text>
            <TouchableOpacity onPress={goToRegister} disabled={isLoading}>
              <Text className="text-brand-pink text-sm font-semibold">Zarejestruj się</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
