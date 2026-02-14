/**
 * Samsung Health (Health Connect) 서비스
 * - Android 전용: Health Connect API에서 러닝 세션을 읽어 SyncActivityItem으로 변환
 */

import { Platform } from 'react-native';
import type { SyncActivityItem } from '@/types/activity';
import {
  initialize,
  requestPermission,
  readRecords,
  getSdkStatus,
  SdkAvailabilityStatus,
  ExerciseType,
} from 'react-native-health-connect';
import type { RecordResult } from 'react-native-health-connect';

export async function isSamsungHealthAvailable(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;

  try {
    const status = await getSdkStatus();
    return status === SdkAvailabilityStatus.SDK_AVAILABLE;
  } catch {
    return false;
  }
}

export async function requestSamsungHealthPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;

  try {
    await initialize();
    await requestPermission([
      { accessType: 'read', recordType: 'ExerciseSession' },
      { accessType: 'read', recordType: 'HeartRate' },
      { accessType: 'read', recordType: 'Distance' },
      { accessType: 'read', recordType: 'TotalCaloriesBurned' },
    ]);
    return true;
  } catch {
    return false;
  }
}

export async function fetchSamsungHealthWorkouts(
  sinceDate: Date
): Promise<SyncActivityItem[]> {
  if (Platform.OS !== 'android') return [];

  try {
    await initialize();
  } catch {
    return [];
  }

  const result = await readRecords('ExerciseSession', {
    timeRangeFilter: {
      operator: 'between',
      startTime: sinceDate.toISOString(),
      endTime: new Date().toISOString(),
    },
  });

  return result.records
    .filter(
      (s) =>
        s.exerciseType === ExerciseType.RUNNING ||
        s.exerciseType === ExerciseType.RUNNING_TREADMILL
    )
    .filter((s) => {
      const duration =
        (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 1000;
      return duration > 60; // 1분 미만 필터링
    })
    .map((s) => mapSessionToSyncItem(s));
}

function mapSessionToSyncItem(
  session: RecordResult<'ExerciseSession'>
): SyncActivityItem {
  const startedAt = new Date(session.startTime).toISOString();
  const endedAt = new Date(session.endTime).toISOString();
  const durationSeconds = Math.round(
    (new Date(session.endTime).getTime() -
      new Date(session.startTime).getTime()) /
      1000
  );

  return {
    external_id: `samsung_health_${session.metadata?.id ?? session.startTime}`,
    started_at: startedAt,
    ended_at: endedAt,
    duration_seconds: durationSeconds,
    distance_meters: 0, // Health Connect ExerciseSession에 직접 포함되지 않음 — 별도 Distance 쿼리 필요
  };
}
