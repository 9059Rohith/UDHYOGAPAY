import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import * as SecureStore from 'expo-secure-store';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check if user has completed onboarding
      const hasOnboarded = await SecureStore.getItemAsync('hasOnboarded');
      
      // Check for auth token
      const token = await SecureStore.getItemAsync('authToken');

      setTimeout(() => {
        if (!hasOnboarded) {
          router.replace('/(auth)/onboarding');
        } else if (!token) {
          router.replace('/(auth)/login');
        } else {
          // Check biometric availability
          router.replace('/(auth)/biometric');
        }
      }, 2000);
    } catch (error) {
      console.error('Error checking auth status:', error);
      router.replace('/(auth)/login');
    }
  };

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>🚀</Text>
        <Text style={styles.title}>UdhyogaPay</Text>
        <Text style={styles.subtitle}>Your Professional Service Partner</Text>
      </View>
      <Text style={styles.version}>Version 1.0.0</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  version: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.7,
  },
});
