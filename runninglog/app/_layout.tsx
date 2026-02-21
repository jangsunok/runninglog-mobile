import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import {
  Montserrat_500Medium,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
} from '@expo-google-fonts/montserrat';
import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import 'react-native-reanimated';

import { SimpleToast } from '@/components/simple-toast';
import { SplashLoadingScreen } from '@/components/splash-loading-screen';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
// 백그라운드 태스크 등록 (앱 로드 시 한 번 필요)
import '@/services/location/backgroundLocationTask';
import '@/services/health/backgroundHealthSyncTask';
import '@/services/health/backgroundSamsungHealthSyncTask';

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

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Montserrat_500Medium,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    BebasNeue_400Regular,
  });

  const [splashTimedOut, setSplashTimedOut] = useState(false);

  // 네이티브 스플래시는 JS 스플래시가 마운트된 후에 숨김 (빈 화면 방지)
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  // 앱 진입: Auth+폰트 준비되면 바로, 안 되면 3초 후 강제 진입
  useEffect(() => {
    if (isReady && fontsLoaded) return;
    const t = setTimeout(() => setSplashTimedOut(true), 3000);
    return () => clearTimeout(t);
  }, [isReady, fontsLoaded]);

  const ready = (isReady && fontsLoaded) || splashTimedOut;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {!ready ? (
        <SplashLoadingScreen />
      ) : (
        <>
          <Stack screenOptions={{ headerShown: false }}>
            {isLoggedIn ? (
              <>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="notifications" />
                <Stack.Screen name="analyze" />
                <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
              </>
            ) : (
              <Stack.Screen name="(auth)" />
            )}
          </Stack>
          <StatusBar style="auto" />
          <Toast config={toastConfig} position="bottom" bottomOffset={48} visibilityTime={3000} />
        </>
      )}
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
