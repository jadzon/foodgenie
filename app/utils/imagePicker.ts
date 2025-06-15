import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export const pickImage = async () => {
  try {    // For web, use the HTML input file picker
    if (Platform.OS === 'web') {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0];
      }
      return null;
    }

    // For native platforms, request permissions first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return null;
    }    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: false,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0];
    }
    
    return null;  } catch (error) {
    console.error('Error picking image:', error);
    
    // Fallback for Expo Go - show helpful message
    if (error instanceof Error && error.message?.includes('expo-image-picker')) {
      alert('Camera/Image picker requires a development build. Please test on web or create a development build.');
      return null;
    }
    
    alert('Error picking image. Please try again.');
    return null;
  }
};

export const takePhoto = async () => {
  try {
    // Camera is not available on web
    if (Platform.OS === 'web') {
      alert('Camera is not available on web. Please use "Pick from Gallery" instead.');
      return null;
    }

    // For native platforms, request permissions first
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to take photos!');
      return null;
    }    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: false,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0];
    }
    
    return null;  } catch (error) {
    console.error('Error taking photo:', error);
    
    // Fallback for Expo Go - show helpful message
    if (error instanceof Error && error.message?.includes('expo-image-picker')) {
      alert('Camera/Image picker requires a development build. Please test on web or create a development build.');
      return null;
    }
    
    alert('Error accessing camera. Please try again.');
    return null;
  }
};
