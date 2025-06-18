import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { colors } from '@/constants/colors';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Hide the splash screen after a short delay
    const hideSplash = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      await SplashScreen.hideAsync();
    };
    
    hideSplash();
  }, []);
  
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.white,
          },
          headerShadowVisible: false,
          headerTitleStyle: {
            fontWeight: '600',
            color: colors.gray800,
          },
          headerBackTitle: 'Back',
          contentStyle: {
            backgroundColor: colors.gray50,
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="task/[id]" 
          options={{ 
            title: 'Task Details',
            presentation: 'card',
          }} 
        />
        <Stack.Screen 
          name="goal/[id]" 
          options={{ 
            title: 'Goal Details',
            presentation: 'card',
          }} 
        />
      </Stack>
    </>
  );
}