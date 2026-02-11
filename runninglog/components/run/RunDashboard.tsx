/**
 * 러닝 중 실시간 수치 대시보드
 * - 거리, 경과 시간, 현재 페이스(min/km)
 * - runStore.liveMetrics 구독
 */

import { StyleSheet, View } from 'react-native';
import { useRunStore } from '@/stores/runStoreSelectors';
import { formatDistance, formatDuration, formatPace } from '@/lib/utils/geo';
import { ThemedText } from '@/components/themed-text';

export function RunDashboard() {
  const { distanceMeters, durationMs, paceMinPerKm } = useRunStore();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.card}>
          <ThemedText style={styles.label}>거리</ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.value}>
            {formatDistance(distanceMeters)}
          </ThemedText>
        </View>
        <View style={styles.card}>
          <ThemedText style={styles.label}>시간</ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.value}>
            {formatDuration(durationMs)}
          </ThemedText>
        </View>
        <View style={styles.card}>
          <ThemedText style={styles.label}>페이스</ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.value}>
            {formatPace(paceMinPerKm)}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  card: {
    alignItems: 'center',
    minWidth: 80,
  },
  label: {
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
  },
});
