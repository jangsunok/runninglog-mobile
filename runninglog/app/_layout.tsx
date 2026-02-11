import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import Toast from 'react-native-toast-message';
import 'react-native-reanimated';

import { SimpleToast } from '@/components/simple-toast';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
// 백그라운드 위치 추적 태스크 등록 (앱 로드 시 한 번 필요)
import '@/services/location/backgroundLocationTask';

const toastConfig = {
  error: (params: { text1?: string; text2?: string; type?: string }) => (
    <SimpleToast text1={params.text1} text2={params.text2} type={params.type} />
  ),
  info: (params: { text1?: string; text2?: string; type?: string }) => (
    <SimpleToast text1={params.text1} text2={params.text2} type={params.type} />
  ),
  success: (params: { text1?: string; text2?: string; type?: string }) => (
    <SimpleToast text1={params.text1} text2={params.text2} type={params.type} />
  ),
};

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isReady, isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isReady) return;
    SplashScreen.hideAsync();
  }, [isReady]);

  if (!isReady) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="analyze" />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </>
        ) : (
          <Stack.Screen name="(auth)" />
        )}
      </Stack>
      <StatusBar style="auto" />
      <Toast config={toastConfig} position="bottom" bottomOffset={48} visibilityTime={3000} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
