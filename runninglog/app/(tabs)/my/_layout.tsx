import { Stack } from 'expo-router';

export default function MyLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="logout" />
    </Stack>
  );
}
