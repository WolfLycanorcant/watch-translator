import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { initializeCache } from '@/lib/cache';

export default function RootLayout() {
  const isReady = useFrameworkReady();

  useEffect(() => {
    // Initialize cache and cleanup on app start
    initializeCache();
  }, []);

  if (!isReady) {
    return null; // Or a loading screen
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.container}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="light" backgroundColor="#171717" />
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
