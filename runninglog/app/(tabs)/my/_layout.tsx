import { Stack } from 'expo-router';

export default function MyLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="logout" />
      <Stack.Screen name="withdraw" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="data-source" />
      <Stack.Screen name="notification-settings" />
      <Stack.Screen name="theme-settings" />
      <Stack.Screen name="subscription" />
      <Stack.Screen name="terms" />
      <Stack.Screen name="support" />
    </Stack>
  );
}
