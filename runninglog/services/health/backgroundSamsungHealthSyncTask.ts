/**
 * Samsung Health (Health Connect) 백그라운드 동기화 태스크 (Android)
 *
 * - expo-task-manager로 등록
 * - 앱 로드 시 import 필요 (app/_layout.tsx)
 */

import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { Platform } from 'react-native';

import { storage } from '@/lib/storage';
import { syncSamsungHealth } from '@/lib/api/sync';
import { fetchSamsungHealthWorkouts } from '@/services/health/samsungHealthService';

export const SAMSUNG_HEALTH_SYNC_TASK = 'SAMSUNG_HEALTH_SYNC';
const LAST_SYNC_KEY = 'samsung_health_last_sync';
const DEFAULT_LOOKBACK_DAYS = 7;

if (Platform.OS === 'android') {
  TaskManager.defineTask(SAMSUNG_HEALTH_SYNC_TASK, async () => {
    try {
      await performSamsungHealthSync();
      return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch {
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  });
}

export async function performSamsungHealthSync(): Promise<number> {
  const lastSyncStr = storage.getString(LAST_SYNC_KEY);
  const sinceDate = lastSyncStr
    ? new Date(lastSyncStr)
    : new Date(Date.now() - DEFAULT_LOOKBACK_DAYS * 24 * 60 * 60 * 1000);

  const activities = await fetchSamsungHealthWorkouts(sinceDate);
  if (activities.length === 0) return 0;

  const response = await syncSamsungHealth({ activities });
  const synced = response.results.filter((r) => r.status === 'created').length;

  storage.set(LAST_SYNC_KEY, new Date().toISOString());
  return synced;
}

export async function registerSamsungHealthSyncTask(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await BackgroundFetch.registerTaskAsync(SAMSUNG_HEALTH_SYNC_TASK, {
    minimumInterval: 15 * 60, // 15분
    stopOnTerminate: false,
    startOnBoot: true,
  });
}

export async function unregisterSamsungHealthSyncTask(): Promise<void> {
  if (Platform.OS !== 'android') return;

  const isRegistered = await TaskManager.isTaskRegisteredAsync(
    SAMSUNG_HEALTH_SYNC_TASK
  );
  if (isRegistered) {
    await BackgroundFetch.unregisterTaskAsync(SAMSUNG_HEALTH_SYNC_TASK);
  }
}
