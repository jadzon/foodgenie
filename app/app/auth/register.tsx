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

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    dateOfBirth: ''
  });
  
  const { register, isLoading, error, clearError } = useAuthStore();

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { username, email, password, confirmPassword, firstName, lastName, dateOfBirth } = formData;
    
    if (!username.trim() || !email.trim() || !password.trim() || !firstName.trim() || !lastName.trim()) {
      Alert.alert('Błąd', 'Proszę wypełnić wszystkie wymagane pola');
      return false;
    }

    if (username.length < 3) {
      Alert.alert('Błąd', 'Nazwa użytkownika musi mieć minimum 3 znaki');
      return false;
    }

    if (password.length < 8) {
      Alert.alert('Błąd', 'Hasło musi mieć minimum 8 znaków');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Błąd', 'Hasła nie są identyczne');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Błąd', 'Proszę podać prawidłowy adres email');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      clearError();
      
      // Prepare data for API
      const registerData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        dateOfBirth: formData.dateOfBirth || new Date().toISOString()
      };

      await register(registerData);
      
      Alert.alert(
        'Rejestracja zakończona pomyślnie!', 
        'Możesz się teraz zalogować',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/auth/login')
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Błąd rejestracji', error.message || 'Wystąpił błąd podczas rejestracji');
    }
  };

  const goToLogin = () => {
    router.replace('/auth/login');
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-raisin-black" 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center items-center px-8 py-12">
          <Image source={Logo} className="w-[150px] h-[150px] mb-6" resizeMode="contain" />
          
          <Text className="text-[32px] font-bold mb-2 text-brand-pink">FoodGenie</Text>
          <Text className="text-base mb-8 text-gray-400">Stwórz nowe konto</Text>

          {error && (
            <View className="w-full mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg">
              <Text className="text-red-400 text-center">{error}</Text>
            </View>
          )}

          <View className="w-full space-y-4">
            <TextInput
              className="w-full h-14 bg-night text-white px-4 rounded-lg border border-gray-700 text-base"
              placeholder="Nazwa użytkownika *"
              value={formData.username}
              onChangeText={(value) => updateField('username', value)}
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />

            <TextInput
              className="w-full h-14 bg-night text-white px-4 rounded-lg border border-gray-700 text-base"
              placeholder="Email *"
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />

            <View className="flex-row space-x-3">
              <TextInput
                className="flex-1 h-14 bg-night text-white px-4 rounded-lg border border-gray-700 text-base"
                placeholder="Imię *"
                value={formData.firstName}
                onChangeText={(value) => updateField('firstName', value)}
                placeholderTextColor="#9CA3AF"
                autoCapitalize="words"
                editable={!isLoading}
              />
              
              <TextInput
                className="flex-1 h-14 bg-night text-white px-4 rounded-lg border border-gray-700 text-base"
                placeholder="Nazwisko *"
                value={formData.lastName}
                onChangeText={(value) => updateField('lastName', value)}
                placeholderTextColor="#9CA3AF"
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>

            <TextInput
              className="w-full h-14 bg-night text-white px-4 rounded-lg border border-gray-700 text-base"
              placeholder="Data urodzenia (opcjonalne)"
              value={formData.dateOfBirth}
              onChangeText={(value) => updateField('dateOfBirth', value)}
              placeholderTextColor="#9CA3AF"
              editable={!isLoading}
            />
            
            <TextInput
              className="w-full h-14 bg-night text-white px-4 rounded-lg border border-gray-700 text-base"
              placeholder="Hasło (min. 8 znaków) *"
              value={formData.password}
              onChangeText={(value) => updateField('password', value)}
              secureTextEntry
              placeholderTextColor="#9CA3AF"
              editable={!isLoading}
            />

            <TextInput
              className="w-full h-14 bg-night text-white px-4 rounded-lg border border-gray-700 text-base"
              placeholder="Potwierdź hasło *"
              value={formData.confirmPassword}
              onChangeText={(value) => updateField('confirmPassword', value)}
              secureTextEntry
              placeholderTextColor="#9CA3AF"
              editable={!isLoading}
            />
            
            <TouchableOpacity
              className={`bg-brand-pink w-full py-4 rounded-lg items-center shadow-lg mt-6 ${
                isLoading ? 'opacity-50' : 'active:opacity-80'
              }`}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text className="text-white font-bold text-lg">
                {isLoading ? 'Rejestrowanie...' : 'Zarejestruj się'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View className="flex-row mt-6">
            <Text className="text-gray-400 text-sm">Masz już konto? </Text>
            <TouchableOpacity onPress={goToLogin} disabled={isLoading}>
              <Text className="text-brand-pink text-sm font-semibold">Zaloguj się</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
