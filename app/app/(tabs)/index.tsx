import { router } from 'expo-router';
import { Camera, ImageIcon, FlipHorizontal, Zap } from 'lucide-react-native';
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useAuthStore from '../../store/authStore';
import { pickImage as pickImageUtil, takePhoto as takePhotoUtil } from '../../utils/imagePicker';

const CameraScreen = () => {
  const insets = useSafeAreaInsets();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { uploadMealImage, isAuthenticated } = useAuthStore();  const pickImage = async () => {
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
    try {
      const result = await takePhotoUtil();
      if (result) {
        setSelectedImage(result.uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Błąd', 'Nie udało się zrobić zdjęcia');
    }
  };

  const uploadImage = async () => {
    if (!selectedImage) {
      Alert.alert('Błąd', 'Najpierw wybierz zdjęcie');
      return;
    }

    if (!isAuthenticated) {
      Alert.alert('Błąd', 'Musisz być zalogowany');
      return;
    }    try {
      setUploading(true);
      const result = await uploadMealImage(selectedImage);
      
      console.log('Upload result:', result);
        // Check if result has the expected properties
      if (result && result.name) {
        const calories = Number(result.totalCalories) || 0;
        const weight = Number(result.totalWeight) || 0;
        const mealName = String(result.name || 'Nowy posiłek');
        const mealId = String(result.id || '');
        
        Alert.alert(
          'Sukces!', 
          `Posiłek "${mealName}" został dodany!\nKalorie: ${calories} kcal\nWaga: ${weight}g`,
          [
            {
              text: 'Zobacz szczegóły',
              onPress: () => {
                if (mealId) {
                  router.push(`/meals/${mealId}`);
                }
              }
            },
            {
              text: 'OK',
              style: 'cancel'
            }
          ]
        );
      } else {
        Alert.alert('Sukces!', 'Posiłek został dodany!');
      }
      
      setSelectedImage(null);
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert('Błąd', error.message || 'Nie udało się przesłać zdjęcia');
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
  };

  if (!isAuthenticated) {
    return (
      <View 
        style={{ paddingTop: insets.top + 20 }} 
        className="flex-1 bg-raisin-black justify-center items-center px-6"
      >
        <Camera size={64} color="#9CA3AF" strokeWidth={1} />
        <Text className="text-xl font-exo2-semibold text-gray-400 mt-4 text-center">
          Musisz się zalogować
        </Text>
        <Text className="text-base font-exo2 text-gray-500 mt-2 text-center">
          Zaloguj się, aby móc skanować posiłki
        </Text>
      </View>
    );
  }

  return (
    <View style={{ paddingTop: insets.top + 20 }} className="flex-1 bg-raisin-black">
      {/* Header */}
      <View className="px-6 mb-8">
        <Text className="text-3xl font-exo2-bold text-white mb-2">
          Skanuj Posiłek
        </Text>
        <Text className="text-base font-exo2 text-gray-400">
          Zrób zdjęcie lub wybierz z galerii
        </Text>
      </View>

      {/* Image Preview */}
      {selectedImage ? (
        <View className="flex-1 mx-6 mb-6">
          <View className="bg-raisin-black border border-brand-pink/30 rounded-2xl p-4 flex-1">
            <Image
              source={{ uri: selectedImage }}
              className="flex-1 rounded-xl"
              resizeMode="cover"
            />
            
            <TouchableOpacity
              onPress={clearImage}
              className="absolute top-6 right-6 bg-black/50 rounded-full p-2"
            >
              <Text className="text-white font-exo2-semibold">✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View className="flex-1 mx-6 mb-6">
          <View className="bg-raisin-black border-2 border-dashed border-gray-600 rounded-2xl flex-1 justify-center items-center">
            <Camera size={80} color="#9CA3AF" strokeWidth={1} />
            <Text className="text-lg font-exo2-semibold text-gray-400 mt-4">
              Brak zdjęcia
            </Text>
            <Text className="text-sm font-exo2 text-gray-500 mt-1 text-center px-8">
              Wybierz zdjęcie z galerii lub zrób nowe
            </Text>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View className="px-6 pb-8">
        {selectedImage ? (
          <TouchableOpacity
            onPress={uploadImage}
            disabled={uploading}
            className="bg-brand-pink rounded-2xl py-4 mb-4 flex-row items-center justify-center"
          >
            {uploading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Zap size={20} color="white" strokeWidth={2} />
                <Text className="text-white font-exo2-semibold text-lg ml-2">
                  Analizuj Posiłek
                </Text>
              </>
            )}
          </TouchableOpacity>
        ) : null}
        
        <View className="flex-row space-x-4">
          <TouchableOpacity
            onPress={takePhoto}
            disabled={uploading}
            className="flex-1 bg-gray-800 rounded-2xl py-4 flex-row items-center justify-center"
          >
            <Camera size={20} color="white" strokeWidth={2} />
            <Text className="text-white font-exo2-semibold ml-2">Kamera</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={pickImage}
            disabled={uploading}
            className="flex-1 bg-gray-800 rounded-2xl py-4 flex-row items-center justify-center"
          >
            <ImageIcon size={20} color="white" strokeWidth={2} />
            <Text className="text-white font-exo2-semibold ml-2">Galeria</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default CameraScreen;