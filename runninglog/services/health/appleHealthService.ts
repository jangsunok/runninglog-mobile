/**
 * Apple HealthKit 서비스
 * - iOS 전용: HealthKit에서 러닝 워크아웃을 읽어 SyncActivityItem으로 변환
 */

import { Platform } from 'react-native';
import type { SyncActivityItem } from '@/types/activity';
import {
  isAvailable,
  requestAuthorization,
  queryWorkouts,
} from '@kayzmann/expo-healthkit';
import type { Workout } from '@kayzmann/expo-healthkit';

export function isAppleHealthAvailable(): boolean {
  if (Platform.OS !== 'ios') return false;
  return isAvailable();
}

export async function requestAppleHealthPermissions(): Promise<boolean> {
  if (!isAppleHealthAvailable()) return false;

  try {
    await requestAuthorization(
      [
        'DistanceWalkingRunning',
        'ActiveEnergyBurned',
        'HeartRate',
        'StepCount',
        'Workout',
      ],
      [] // write permissions (none needed)
    );
    return true;
  } catch {
    return false;
  }
}

export async function fetchAppleHealthWorkouts(
  sinceDate: Date
): Promise<SyncActivityItem[]> {
  if (!isAppleHealthAvailable()) return [];

  const workouts: Workout[] = await queryWorkouts({
    startDate: sinceDate,
    endDate: new Date(),
  });

  return workouts
    .filter((w) => w.activityType === 'running')
    .filter((w) => w.duration > 60) // 1분 미만 필터링
    .map((w) => mapWorkoutToSyncItem(w));
}

function mapWorkoutToSyncItem(workout: Workout): SyncActivityItem {
  const startedAt = new Date(workout.startDate).toISOString();
  const endedAt = new Date(workout.endDate).toISOString();
  const durationSeconds = Math.round(workout.duration);
  const distanceMeters = (workout.distance ?? 0) * 1000; // km → m

  return {
    external_id: `apple_health_${workout.id}`,
    started_at: startedAt,
    ended_at: endedAt,
    duration_seconds: durationSeconds,
    distance_meters: distanceMeters,
    calories: workout.calories
      ? Math.round(workout.calories)
      : undefined,
  };
}
