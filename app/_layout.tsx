import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { colors } from '@/constants/colors';

export default function RootLayout() {
  const isReady = useFrameworkReady();

  if (!isReady) {
    return null;
  }

  return (
    <>
      <StatusBar style="auto" />
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
        <Stack.Screen 
          name="settings" 
          options={{ 
            title: 'Settings',
            presentation: 'card',
          }} 
        />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}