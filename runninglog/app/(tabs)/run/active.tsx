import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

/**
 * 러닝 중 화면 (GPS 트래킹 연동은 RUNNING_TRACKING_ARCHITECTURE.md 참고)
 * MapView, Dashboard, 시작/일시정지/종료 버튼 구현 예정
 */
export default function RunActiveScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        러닝
      </ThemedText>
      <ThemedText style={styles.subtitle}>
        지도·거리·페이스·시작/일시정지/종료 UI는 러닝 트래킹 아키텍처에 따라 연동 예정입니다.
      </ThemedText>
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
    textAlign: 'center',
  },
});
