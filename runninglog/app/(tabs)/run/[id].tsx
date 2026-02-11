import { useEffect, useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getActivity } from '@/lib/api/activities';
import type { ActivityDetail } from '@/types/activity';
import { ApiError } from '@/lib/api/client';

export default function RunDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const activityId = id ? parseInt(id, 10) : NaN;
  const [activity, setActivity] = useState<ActivityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(activityId)) {
      setError('잘못된 기록입니다.');
      setLoading(false);
      return;
    }
    let cancelled = false;
    getActivity(activityId)
      .then((data) => {
        if (!cancelled) setActivity(data);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof ApiError ? e.message : '불러오지 못했습니다.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activityId]);

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }
  if (error || !activity) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText style={styles.errorText}>{error ?? '기록을 찾을 수 없습니다.'}</ThemedText>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={styles.backButtonText}>돌아가기</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ThemedText type="title" style={styles.title}>
        {activity.title}
      </ThemedText>
      <ThemedText style={styles.meta}>
        {activity.started_at.slice(0, 10)} · {activity.distance_km} km · {activity.duration_display}
      </ThemedText>
      <ThemedView style={styles.section}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          요약
        </ThemedText>
        <ThemedText style={styles.body}>평균 페이스: {activity.average_pace_display}</ThemedText>
        {activity.best_pace_display && (
          <ThemedText style={styles.body}>최고 페이스: {activity.best_pace_display}</ThemedText>
        )}
        {activity.calories > 0 && (
          <ThemedText style={styles.body}>칼로리: {activity.calories} kcal</ThemedText>
        )}
      </ThemedView>
      {activity.notes ? (
        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            메모
          </ThemedText>
          <ThemedText style={styles.body}>{activity.notes}</ThemedText>
        </ThemedView>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    marginBottom: 8,
  },
  meta: {
    opacity: 0.8,
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  body: {
    opacity: 0.9,
    marginBottom: 4,
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 16,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  backButtonText: {
    opacity: 0.9,
  },
});
