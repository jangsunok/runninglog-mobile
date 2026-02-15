import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function MyLayout() {
  const colorScheme = useColorScheme();
  const bg = Colors[colorScheme ?? 'light'].background;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={['top']}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="logout" />
        <Stack.Screen name="withdraw" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="data-source" />
        <Stack.Screen name="notification-settings" />
        <Stack.Screen name="theme-settings" />
        <Stack.Screen name="profile-settings" />
        <Stack.Screen name="subscription" />
        <Stack.Screen name="terms" />
        <Stack.Screen name="support" />
        <Stack.Screen name="licenses" />
        <Stack.Screen name="monthly-report" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
      </Stack>
    </SafeAreaView>
  );
}
