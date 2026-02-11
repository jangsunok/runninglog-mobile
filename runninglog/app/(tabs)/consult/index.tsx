import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ConsultListScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backRow}>
        <ThemedText type="link">← 뒤로</ThemedText>
      </Pressable>
      <ThemedText type="title" style={styles.title}>
        고민상담
      </ThemedText>
      <ThemedText style={styles.subtitle}>
        달리기·스포츠·건강 관련 고민을 검색하고 질문할 수 있습니다.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 56,
  },
  backRow: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    opacity: 0.8,
  },
});
