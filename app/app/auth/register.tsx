import { router } from 'expo-router';
import { ChevronLeft, ChevronRight, Check, User, Mail, Lock, Eye, EyeOff, Calendar } from 'lucide-react-native';
import React, { useState, useRef } from 'react';
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
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions
} from 'react-native';
import Animated, { FadeInRight, FadeOutLeft, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAuthStore from '../../store/authStore';
import Logo from "../../assets/images/icon.png";

const { height: screenHeight } = Dimensions.get('window');

export default function RegisterScreen() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
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
    if (field === 'dateOfBirth') {
      // Format date input as dd/mm/yyyy
      let formattedValue = value.replace(/\D/g, ''); // Remove non-digits
      
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.substring(0, 2) + '/' + formattedValue.substring(2);
      }
      if (formattedValue.length >= 5) {
        formattedValue = formattedValue.substring(0, 5) + '/' + formattedValue.substring(5, 9);
      }
      
      setFormData(prev => ({ ...prev, [field]: formattedValue }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const validateDateOfBirth = (dateStr: string) => {
    if (!dateStr) return false;
    
    const parts = dateStr.split('/');
    if (parts.length !== 3) return false;
    
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const year = parseInt(parts[2]);
    
    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > new Date().getFullYear()) {
      return false;
    }
    
    // Check if date is valid
    const date = new Date(year, month - 1, day);
    return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
          Alert.alert('Błąd', 'Podaj swoje imię i nazwisko');
          return false;
        }
        return true;
      case 2:
        if (!formData.username.trim()) {
          Alert.alert('Błąd', 'Podaj nazwę użytkownika');
          return false;
        }
        if (formData.username.length < 3) {
          Alert.alert('Błąd', 'Nazwa użytkownika musi mieć minimum 3 znaki');
          return false;
        }
        if (!formData.email.trim()) {
          Alert.alert('Błąd', 'Podaj adres email');
          return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          Alert.alert('Błąd', 'Podaj prawidłowy adres email');
          return false;
        }
        return true;
      case 3:
        if (!formData.password.trim()) {
          Alert.alert('Błąd', 'Podaj hasło');
          return false;
        }
        if (formData.password.length < 8) {
          Alert.alert('Błąd', 'Hasło musi mieć minimum 8 znaków');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          Alert.alert('Błąd', 'Hasła nie są identyczne');
          return false;
        }
        return true;
      case 4:
        if (!formData.dateOfBirth.trim()) {
          Alert.alert('Błąd', 'Podaj datę urodzenia');
          return false;
        }
        if (!validateDateOfBirth(formData.dateOfBirth)) {
          Alert.alert('Błąd', 'Podaj prawidłową datę w formacie DD/MM/YYYY');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleRegister = async () => {
    try {
      clearError();
      
      // Parse date from DD/MM/YYYY format
      const dateParts = formData.dateOfBirth.split('/');
      const birthDate = new Date(
        parseInt(dateParts[2]), // year
        parseInt(dateParts[1]) - 1, // month (0-indexed)
        parseInt(dateParts[0]) // day
      );
      
      const registerData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        dateOfBirth: birthDate.toISOString()
      };

      await register(registerData);
      
      Alert.alert(
        'Witaj w FoodGenie!', 
        'Konto zostało utworzone. Możesz się teraz zalogować.',
        [
          {
            text: 'Zaloguj się',
            onPress: () => router.replace('auth/login')
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Błąd rejestracji', error.message || 'Spróbuj ponownie');
    }
  };

  const goToLogin = () => {
    router.replace('auth/login');
  };

  const renderProgressBar = () => (
    <View className="flex-row items-center justify-center mb-6">
      {[1, 2, 3, 4].map((step) => (
        <View key={step} className="flex-row items-center">
          <View className={`w-8 h-8 rounded-full items-center justify-center ${
            currentStep >= step ? 'bg-brand-pink' : 'bg-raisin-black border border-gray-600'
          }`}>
            {currentStep > step ? (
              <Check size={16} color="white" strokeWidth={2.5} />
            ) : (
              <Text className={`font-exo2-bold text-sm ${
                currentStep >= step ? 'text-white' : 'text-gray-400'
              }`}>
                {step}
              </Text>
            )}
          </View>
          {step < 4 && (
            <View className={`w-8 h-0.5 mx-2 ${
              currentStep > step ? 'bg-brand-pink' : 'bg-gray-600'
            }`} />
          )}
        </View>
      ))}
    </View>
  );

  const getDaysInMonth = (month: string, year: string) => {
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString().padStart(2, '0'));
  };

  const renderDateSlotPicker = () => {
    const days = getDaysInMonth(formData.birthMonth, formData.birthYear);
    const months = [
      { value: '01', label: 'Sty' },
      { value: '02', label: 'Lut' },
      { value: '03', label: 'Mar' },
      { value: '04', label: 'Kwi' },
      { value: '05', label: 'Maj' },
      { value: '06', label: 'Cze' },
      { value: '07', label: 'Lip' },
      { value: '08', label: 'Sie' },
      { value: '09', label: 'Wrz' },
      { value: '10', label: 'Paź' },
      { value: '11', label: 'Lis' },
      { value: '12', label: 'Gru' }
    ];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 125 }, (_, i) => (currentYear - i).toString());

    // Adjust day if current day doesn't exist in selected month
    const maxDay = days.length.toString().padStart(2, '0');
    if (parseInt(formData.birthDay) > days.length) {
      updateField('birthDay', maxDay);
    }

    return (
      <View className="bg-raisin-black rounded-2xl p-4 border border-brand-pink/30 mb-4">
        <View className="flex-row space-x-4">
          {/* Day Picker */}
          <View className="flex-1">
            <Text className="text-gray-400 font-exo2 text-sm mb-3 text-center">Dzień</Text>
            <View className="bg-night rounded-xl border border-gray-600 max-h-32 overflow-hidden">
              {days.map((day) => (
                <TouchableOpacity
                  key={day}
                  onPress={() => updateField('birthDay', day)}
                  className={`py-3 items-center border-b border-gray-700 ${
                    formData.birthDay === day ? 'bg-brand-pink' : ''
                  }`}
                >
                  <Text className={`font-exo2-semibold ${
                    formData.birthDay === day ? 'text-white' : 'text-gray-400'
                  }`}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Month Picker */}
          <View className="flex-1">
            <Text className="text-gray-400 font-exo2 text-sm mb-3 text-center">Miesiąc</Text>
            <View className="bg-night rounded-xl border border-gray-600 max-h-32 overflow-hidden">
              {months.map((month) => (
                <TouchableOpacity
                  key={month.value}
                  onPress={() => updateField('birthMonth', month.value)}
                  className={`py-3 items-center border-b border-gray-700 ${
                    formData.birthMonth === month.value ? 'bg-brand-pink' : ''
                  }`}
                >
                  <Text className={`font-exo2-semibold text-xs ${
                    formData.birthMonth === month.value ? 'text-white' : 'text-gray-400'
                  }`}>
                    {month.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Year Picker */}
          <View className="flex-1">
            <Text className="text-gray-400 font-exo2 text-sm mb-3 text-center">Rok</Text>
            <View className="bg-night rounded-xl border border-gray-600 max-h-32 overflow-hidden">
              {years.slice(0, 50).map((year) => (
                <TouchableOpacity
                  key={year}
                  onPress={() => updateField('birthYear', year)}
                  className={`py-3 items-center border-b border-gray-700 ${
                    formData.birthYear === year ? 'bg-brand-pink' : ''
                  }`}
                >
                  <Text className={`font-exo2-semibold ${
                    formData.birthYear === year ? 'text-white' : 'text-gray-400'
                  }`}>
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Selected Date Display */}
        <View className="mt-4 bg-night rounded-xl p-3 border border-brand-pink/30">
          <Text className="text-center text-brand-pink font-exo2-semibold">
            Wybrano: {formData.birthDay}.{formData.birthMonth}.{formData.birthYear}
          </Text>
        </View>
      </View>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Animated.View 
            entering={FadeInRight.duration(400)}
            className="w-full"
          >
            <View className="items-center mb-6">
              <View className="bg-brand-pink/20 p-4 rounded-full mb-4">
                <User size={32} color="#f7438d" strokeWidth={2} />
              </View>
              <Text className="text-white text-2xl font-exo2-bold mb-2">
                Jak się nazywasz?
              </Text>
              <Text className="text-gray-400 font-exo2 text-center">
                Podaj swoje imię i nazwisko
              </Text>
            </View>

            <View className="space-y-4">
              <TextInput
                className="w-full h-14 bg-raisin-black text-white px-4 rounded-2xl border border-brand-pink/30 text-base font-exo2"
                placeholder="Imię"
                value={formData.firstName}
                onChangeText={(value) => updateField('firstName', value)}
                placeholderTextColor="#6B7280"
                autoCapitalize="words"
                returnKeyType="next"
              />
              
              <TextInput
                className="w-full h-14 bg-raisin-black text-white px-4 rounded-2xl border border-brand-pink/30 text-base font-exo2"
                placeholder="Nazwisko"
                value={formData.lastName}
                onChangeText={(value) => updateField('lastName', value)}
                placeholderTextColor="#6B7280"
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={nextStep}
              />
            </View>
          </Animated.View>
        );

      case 2:
        return (
          <Animated.View 
            entering={FadeInRight.duration(400)}
            className="w-full"
          >
            <View className="items-center mb-6">
              <View className="bg-brand-pink/20 p-4 rounded-full mb-4">
                <Mail size={32} color="#f7438d" strokeWidth={2} />
              </View>
              <Text className="text-white text-2xl font-exo2-bold mb-2">
                Dane kontaktowe
              </Text>
              <Text className="text-gray-400 font-exo2 text-center">
                Wybierz nazwę użytkownika i podaj email
              </Text>
            </View>

            <View className="space-y-4">
              <TextInput
                className="w-full h-14 bg-raisin-black text-white px-4 rounded-2xl border border-brand-pink/30 text-base font-exo2"
                placeholder="Nazwa użytkownika"
                value={formData.username}
                onChangeText={(value) => updateField('username', value)}
                placeholderTextColor="#6B7280"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />

              <TextInput
                className="w-full h-14 bg-raisin-black text-white px-4 rounded-2xl border border-brand-pink/30 text-base font-exo2"
                placeholder="Adres email"
                value={formData.email}
                onChangeText={(value) => updateField('email', value)}
                placeholderTextColor="#6B7280"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={nextStep}
              />
            </View>
          </Animated.View>
        );

      case 3:
        return (
          <Animated.View 
            entering={FadeInRight.duration(400)}
            className="w-full"
          >
            <View className="items-center mb-6">
              <View className="bg-brand-pink/20 p-4 rounded-full mb-4">
                <Lock size={32} color="#f7438d" strokeWidth={2} />
              </View>
              <Text className="text-white text-2xl font-exo2-bold mb-2">
                Zabezpiecz konto
              </Text>
              <Text className="text-gray-400 font-exo2 text-center">
                Utwórz silne hasło (minimum 8 znaków)
              </Text>
            </View>

            <View className="space-y-4">
              <View className="relative">
                <TextInput
                  className="w-full h-14 bg-raisin-black text-white pl-4 pr-12 rounded-2xl border border-brand-pink/30 text-base font-exo2"
                  placeholder="Hasło"
                  value={formData.password}
                  onChangeText={(value) => updateField('password', value)}
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#6B7280"
                  returnKeyType="next"
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

              <View className="relative">
                <TextInput
                  className="w-full h-14 bg-raisin-black text-white pl-4 pr-12 rounded-2xl border border-brand-pink/30 text-base font-exo2"
                  placeholder="Potwierdź hasło"
                  value={formData.confirmPassword}
                  onChangeText={(value) => updateField('confirmPassword', value)}
                  secureTextEntry={!showConfirmPassword}
                  placeholderTextColor="#6B7280"
                  returnKeyType="done"
                  onSubmitEditing={nextStep}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-4"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="#9CA3AF" strokeWidth={2} />
                  ) : (
                    <Eye size={20} color="#9CA3AF" strokeWidth={2} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        );

      case 4:
        return (
          <Animated.View 
            entering={FadeInRight.duration(400)}
            className="w-full"
          >
            <View className="items-center mb-6">
              <View className="bg-brand-pink/20 p-4 rounded-full mb-4">
                <Calendar size={32} color="#f7438d" strokeWidth={2} />
              </View>
              <Text className="text-white text-2xl font-exo2-bold mb-2">
                Data urodzenia
              </Text>
              <Text className="text-gray-400 font-exo2 text-center mb-6">
                Podaj swoją datę urodzenia w formacie DD/MM/YYYY
              </Text>
            </View>

            <View className="mb-6">
              <TextInput
                className="w-full h-14 bg-raisin-black text-white px-4 rounded-2xl border border-brand-pink/30 text-base font-exo2"
                placeholder="DD/MM/YYYY"
                value={formData.dateOfBirth}
                onChangeText={(value) => updateField('dateOfBirth', value)}
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
                maxLength={10}
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />
              <Text className="text-gray-400 font-exo2 text-xs mt-2 px-2">
                Przykład: 25/12/1990
              </Text>
            </View>

            <View className="bg-raisin-black p-4 rounded-2xl border border-brand-pink/20">
              <Text className="text-white font-exo2-semibold text-lg mb-3">
                Podsumowanie
              </Text>
              <View className="space-y-2">
                <Text className="text-gray-400 font-exo2">
                  <Text className="text-white">Imię:</Text> {formData.firstName} {formData.lastName}
                </Text>
                <Text className="text-gray-400 font-exo2">
                  <Text className="text-white">Użytkownik:</Text> @{formData.username}
                </Text>
                <Text className="text-gray-400 font-exo2">
                  <Text className="text-white">Email:</Text> {formData.email}
                </Text>
                <Text className="text-gray-400 font-exo2">
                  <Text className="text-white">Data urodzenia:</Text> {formData.dateOfBirth || 'Nie podano'}
                </Text>
              </View>
            </View>
          </Animated.View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-night">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1">
          <KeyboardAvoidingView 
            className="flex-1" 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
          >
            <ScrollView 
              ref={scrollViewRef}
              className="flex-1"
              contentContainerStyle={{ 
                flexGrow: 1,
                paddingBottom: Platform.OS === 'android' ? 50 : 20
              }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <View className="flex-1 px-6 py-6">
                {/* Header */}
                <Animated.View 
                  entering={FadeInDown.delay(100).duration(600)}
                  className="items-center mb-6"
                >
                  <Image source={Logo} className="w-16 h-16 mb-3" resizeMode="contain" />
                  <Text className="text-xl font-exo2-bold text-brand-pink mb-1">
                    Dołącz do FoodGenie
                  </Text>
                </Animated.View>

                {/* Progress Bar */}
                {renderProgressBar()}

                {/* Error Message */}
                {error && (
                  <View className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-2xl">
                    <Text className="text-red-400 text-center font-exo2 text-sm">{error}</Text>
                  </View>
                )}

                {/* Steps */}
                <View className="flex-1 justify-center py-4">
                  {renderStep()}
                </View>
              </View>
            </ScrollView>

            {/* Fixed Navigation at bottom */}
            <View className="bg-night border-t border-gray-800 px-6 py-4">
              <View className="flex-row items-center justify-between">
                {currentStep > 1 ? (
                  <TouchableOpacity
                    onPress={prevStep}
                    className="bg-raisin-black border border-brand-pink/30 rounded-2xl py-3 px-6 flex-row items-center"
                  >
                    <ChevronLeft size={20} color="#f7438d" strokeWidth={2} />
                    <Text className="text-brand-pink font-exo2-semibold ml-1">
                      Wstecz
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View />
                )}

                {currentStep < 4 ? (
                  <TouchableOpacity
                    onPress={nextStep}
                    className="bg-brand-pink rounded-2xl py-3 px-6 flex-row items-center"
                  >
                    <Text className="text-white font-exo2-bold mr-1">
                      Dalej
                    </Text>
                    <ChevronRight size={20} color="white" strokeWidth={2} />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={handleRegister}
                    disabled={isLoading}
                    className={`bg-brand-pink rounded-2xl py-3 px-6 flex-row items-center ${
                      isLoading ? 'opacity-70' : ''
                    }`}
                  >
                    <Text className="text-white font-exo2-bold">
                      {isLoading ? 'Tworzę konto...' : 'Utwórz konto'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Footer */}
              <View className="items-center mt-4">
                <View className="flex-row items-center">
                  <Text className="text-gray-400 text-sm font-exo2">Masz już konto? </Text>
                  <TouchableOpacity onPress={goToLogin}>
                    <Text className="text-brand-pink text-sm font-exo2-semibold">
                      Zaloguj się
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}