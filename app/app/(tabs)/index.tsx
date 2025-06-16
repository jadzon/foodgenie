import { router, useFocusEffect } from 'expo-router';
import { Camera as CameraIcon, ImageIcon, Zap, X, FlipHorizontal, RotateCcw } from 'lucide-react-native';
import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import Animated, { FadeIn, FadeInUp, SlideInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAuthStore from '../../store/authStore';
import { pickImage as pickImageUtil } from '../../utils/imagePicker';

const { width, height } = Dimensions.get('window');

const CameraScreen = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const { uploadMealImage, isAuthenticated } = useAuthStore();

  // Handle screen focus/unfocus to properly manage camera
  useFocusEffect(
    useCallback(() => {
      // When screen is focused, activate camera
      setIsCameraActive(true);
      
      return () => {
        // When screen loses focus, deactivate camera
        setIsCameraActive(false);
        // Clear selected image if any
        setSelectedImage(null);
      };
    }, [])
  );

  const pickImage = async () => {
    try {
      const result = await pickImageUtil();
      if (result) {
        setSelectedImage(result.uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Błąd', 'Nie udało się wybrać zdjęcia');
    }
  };

  const takePhoto = async () => {
    if (!cameraRef.current || !isCameraActive) {
      Alert.alert('Błąd', 'Kamera nie jest gotowa');
      return;
    }

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: true,
        mute: true,
      });
      
      if (photo?.uri) {
        setSelectedImage(photo.uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Błąd', 'Nie udało się zrobić zdjęcia. Spróbuj ponownie.');
    }
  };

  const uploadImage = async () => {
    if (!selectedImage) return;

    try {
      setUploading(true);
      const result = await uploadMealImage(selectedImage);
      
      if (result && result.name) {
        const calories = Number(result.totalCalories) || 0;
        const weight = Number(result.totalWeight) || 0;
        const mealName = String(result.name || 'Nowy posiłek');
        const mealId = String(result.id || '');
        
        Alert.alert(
          'Analiza zakończona', 
          `${mealName}\n${calories} kcal • ${weight}g`,
          [
            {
              text: 'Zobacz szczegóły',
              onPress: () => {
                if (mealId) {
                  router.push(`/meals/${mealId}`);
                }
              }
            },
            { text: 'OK', style: 'cancel' }
          ]
        );
      } else {
        Alert.alert('Sukces', 'Posiłek został dodany do biblioteki');
      }
      
      setSelectedImage(null);
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert('Błąd', error.message || 'Nie udało się przesłać zdjęcia');
    } finally {
      setUploading(false);
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const resetCamera = () => {
    setSelectedImage(null);
    setIsCameraActive(false);
    // Small delay to ensure camera is properly reset
    setTimeout(() => {
      setIsCameraActive(true);
    }, 100);
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-night justify-center items-center px-6">
        <Animated.View entering={FadeIn.duration(600)} className="items-center">
          <View className="w-20 h-20 bg-raisin-black rounded-full items-center justify-center mb-6 border border-brand-pink/30">
            <CameraIcon size={40} color="#f7438d" strokeWidth={1.5} />
          </View>
          <Text className="text-white text-xl font-exo2-bold mb-3">Wymagane logowanie</Text>
          <Text className="text-gray-400 font-exo2 text-center">
            Zaloguj się, aby móc analizować posiłki
          </Text>
        </Animated.View>
      </SafeAreaView>
    );
  }

  if (!permission) {
    return (
      <SafeAreaView className="flex-1 bg-night justify-center items-center px-6">
        <ActivityIndicator size="large" color="#f7438d" />
        <Text className="text-white text-lg font-exo2 mt-4">Sprawdzanie uprawnień...</Text>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-night justify-center items-center px-6">
        <Animated.View entering={FadeIn.duration(600)} className="items-center">
          <View className="w-20 h-20 bg-raisin-black rounded-full items-center justify-center mb-6 border border-brand-pink/30">
            <CameraIcon size={40} color="#f7438d" strokeWidth={1.5} />
          </View>
          <Text className="text-white text-xl font-exo2-bold mb-3">Dostęp do kamery</Text>
          <Text className="text-gray-400 font-exo2 text-center mb-8">
            Potrzebujemy dostępu do kamery, aby skanować posiłki
          </Text>
          <TouchableOpacity
            onPress={requestPermission}
            className="bg-brand-pink rounded-2xl py-4 px-8"
          >
            <Text className="text-white font-exo2-bold text-lg">
              Zezwól na dostęp
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }

  if (selectedImage) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <Animated.View entering={FadeIn.duration(500)} className="flex-1">
          <Image
            source={{ uri: selectedImage }}
            style={{ width, height }}
            resizeMode="cover"
          />
          
          {/* Close button */}
          <TouchableOpacity
            onPress={resetCamera}
            className="absolute top-4 left-4 bg-black/60 rounded-full p-3"
          >
            <X size={24} color="white" strokeWidth={2} />
          </TouchableOpacity>

          {/* Bottom controls */}
          <Animated.View 
            entering={SlideInDown.delay(300).duration(600)}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pb-12"
          >
            <TouchableOpacity
              onPress={uploadImage}
              disabled={uploading}
              className={`bg-brand-pink rounded-2xl py-4 flex-row items-center justify-center shadow-lg mb-4 ${
                uploading ? 'opacity-70' : ''
              }`}
            >
              {uploading ? (
                <>
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-white font-exo2-bold text-lg ml-3">
                    Analizuję posiłek...
                  </Text>
                </>
              ) : (
                <>
                  <Zap size={24} color="white" strokeWidth={2.5} />
                  <Text className="text-white font-exo2-bold text-lg ml-2">
                    Analizuj Posiłek
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={resetCamera}
                className="flex-1 bg-raisin-black/80 backdrop-blur rounded-2xl py-4 flex-row items-center justify-center border border-brand-pink/30"
              >
                <RotateCcw size={20} color="#f7438d" strokeWidth={2} />
                <Text className="text-brand-pink font-exo2-semibold text-base ml-2">Ponów</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={pickImage}
                className="flex-1 bg-raisin-black/80 backdrop-blur rounded-2xl py-4 flex-row items-center justify-center border border-brand-pink/30"
              >
                <ImageIcon size={20} color="#f7438d" strokeWidth={2} />
                <Text className="text-brand-pink font-exo2-semibold text-base ml-2">Galeria</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1">
        {/* Live Camera Feed - only render when active */}
        {isCameraActive && permission.granted ? (
          <CameraView
            ref={cameraRef}
            style={{ flex: 1 }}
            facing={facing}
            mode="picture"
          >
            {/* Header with title */}
            <Animated.View 
              entering={FadeInUp.delay(100).duration(600)}
              className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-6 pt-12"
            >
              <Text className="text-white text-2xl font-exo2-bold text-center tracking-tight">
                Skanuj Posiłek
              </Text>
              <Text className="text-white/80 font-exo2 text-center mt-1">
                Skieruj kamerę na jedzenie
              </Text>
            </Animated.View>

            {/* Scan frame overlay */}
            <Animated.View 
              entering={FadeIn.delay(500).duration(800)}
              className="absolute inset-0 items-center justify-center"
            >
              <View className="w-80 h-80 border-2 border-dashed border-brand-pink/70 rounded-3xl" />
              <View className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <View className="w-6 h-6 border-t-4 border-l-4 border-brand-pink absolute -top-12 -left-12" />
                <View className="w-6 h-6 border-t-4 border-r-4 border-brand-pink absolute -top-12 -right-12" />
                <View className="w-6 h-6 border-b-4 border-l-4 border-brand-pink absolute -bottom-12 -left-12" />
                <View className="w-6 h-6 border-b-4 border-r-4 border-brand-pink absolute -bottom-12 -right-12" />
              </View>
            </Animated.View>

            {/* Bottom controls */}
            <Animated.View 
              entering={SlideInDown.delay(300).duration(600)}
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pb-12"
            >
              <View className="flex-row items-center justify-center space-x-6">
                {/* Gallery button */}
                <TouchableOpacity
                  onPress={pickImage}
                  className="bg-raisin-black/70 backdrop-blur rounded-2xl p-4 border border-brand-pink/30"
                >
                  <ImageIcon size={28} color="#f7438d" strokeWidth={2} />
                </TouchableOpacity>

                {/* Take photo button */}
                <TouchableOpacity
                  onPress={takePhoto}
                  className="bg-brand-pink rounded-full p-6 shadow-2xl border-4 border-white/30"
                  disabled={!isCameraActive}
                >
                  <CameraIcon size={36} color="white" strokeWidth={2.5} />
                </TouchableOpacity>

                {/* Camera flip button */}
                <TouchableOpacity
                  onPress={toggleCameraFacing}
                  className="bg-raisin-black/70 backdrop-blur rounded-2xl p-4 border border-brand-pink/30"
                  disabled={!isCameraActive}
                >
                  <FlipHorizontal size={28} color="#f7438d" strokeWidth={2} />
                </TouchableOpacity>
              </View>

              <Text className="text-white/60 font-exo2 text-center mt-4 text-sm">
                Dotknij różowego przycisku, aby zrobić zdjęcie
              </Text>
            </Animated.View>
          </CameraView>
        ) : (
          // Loading state while camera initializes
          <View className="flex-1 justify-center items-center bg-black">
            <ActivityIndicator size="large" color="#f7438d" />
            <Text className="text-white text-lg font-exo2 mt-4">Uruchamianie kamery...</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default CameraScreen;