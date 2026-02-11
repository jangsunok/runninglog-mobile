import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useActivities } from '@/hooks/use-activities';
import type { ActivityListItem } from '@/types/activity';

export default function RunScreen() {
  const { data, loading, error, refetch } = useActivities({ pageSize: 20 });

  function handleRunStart() {
    router.push('/run/active');
  }

  function handleActivityPress(activityId: number) {
    router.push(`/run/${activityId}`);
  }

  function renderItem({ item }: { item: ActivityListItem }) {
    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => handleActivityPress(item.activity_id)}
        activeOpacity={0.7}
      >
        <ThemedText type="defaultSemiBold" style={styles.rowTitle} numberOfLines={1}>
          {item.title}
        </ThemedText>
        <ThemedText style={styles.rowMeta}>
          {item.distance_km} km · {item.duration_display} · {item.average_pace_display}
        </ThemedText>
      </TouchableOpacity>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          달리기 기록
        </ThemedText>
        <TouchableOpacity style={styles.startButton} onPress={handleRunStart} activeOpacity={0.8}>
          <ThemedText type="defaultSemiBold" style={styles.startButtonText}>
            러닝 시작
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {loading && !data ? (
        <ThemedView style={styles.centered}>
          <ActivityIndicator size="large" />
        </ThemedView>
      ) : error ? (
        <ThemedView style={styles.centered}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </ThemedView>
      ) : data && data.results.length === 0 ? (
        <ThemedView style={styles.centered}>
          <ThemedText style={styles.emptyText}>기록이 없습니다. 러닝을 시작해 보세요.</ThemedText>
        </ThemedView>
      ) : data ? (
        <FlatList
          data={data.results}
          keyExtractor={(item) => String(item.activity_id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={loading && !!data} onRefresh={refetch} />
          }
        />
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
  },
  startButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#22c55e',
  },
  startButtonText: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  row: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.3)',
  },
  rowTitle: {
    marginBottom: 4,
  },
  rowMeta: {
    fontSize: 13,
    opacity: 0.8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
  },
  emptyText: {
    opacity: 0.8,
    textAlign: 'center',
  },
});
