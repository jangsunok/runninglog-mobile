import { Stack } from 'expo-router';

export default function RunLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="active" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
