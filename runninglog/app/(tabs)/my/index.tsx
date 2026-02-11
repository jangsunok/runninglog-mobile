import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function MyScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        마이페이지
      </ThemedText>
      <ThemedText style={styles.subtitle}>
        프로필, 설정, 알림 등이 이곳에 표시됩니다.
      </ThemedText>
      <Pressable
        onPress={() => router.push('/(tabs)/my/logout')}
        style={({ pressed }) => [styles.logout, pressed && styles.logoutPressed]}
      >
        <ThemedText type="link">로그아웃</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    opacity: 0.8,
    marginBottom: 24,
    textAlign: 'center',
  },
  logout: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  logoutPressed: {
    opacity: 0.8,
  },
});
