/**
 * Apple Health 백그라운드 동기화 태스크 (iOS)
 *
 * - expo-task-manager로 등록
 * - 앱 로드 시 import 필요 (app/_layout.tsx)
 */

import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { Platform } from 'react-native';

import { storage } from '@/lib/storage';
import { syncAppleHealth } from '@/lib/api/sync';
import { fetchAppleHealthWorkouts } from '@/services/health/appleHealthService';

export const APPLE_HEALTH_SYNC_TASK = 'APPLE_HEALTH_SYNC';
const LAST_SYNC_KEY = 'apple_health_last_sync';
const DEFAULT_LOOKBACK_DAYS = 7;

if (Platform.OS === 'ios') {
  TaskManager.defineTask(APPLE_HEALTH_SYNC_TASK, async () => {
    try {
      await performAppleHealthSync();
      return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch {
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  });
}

export async function performAppleHealthSync(): Promise<number> {
  const lastSyncStr = storage.getString(LAST_SYNC_KEY);
  const sinceDate = lastSyncStr
    ? new Date(lastSyncStr)
    : new Date(Date.now() - DEFAULT_LOOKBACK_DAYS * 24 * 60 * 60 * 1000);

  const activities = await fetchAppleHealthWorkouts(sinceDate);
  if (activities.length === 0) return 0;

  const response = await syncAppleHealth({ activities });
  const synced = response.results.filter((r) => r.status === 'created').length;

  storage.set(LAST_SYNC_KEY, new Date().toISOString());
  return synced;
}

export async function registerAppleHealthSyncTask(): Promise<void> {
  if (Platform.OS !== 'ios') return;

  await BackgroundFetch.registerTaskAsync(APPLE_HEALTH_SYNC_TASK, {
    minimumInterval: 15 * 60, // 15분
    stopOnTerminate: false,
    startOnBoot: true,
  });
}

export async function unregisterAppleHealthSyncTask(): Promise<void> {
  if (Platform.OS !== 'ios') return;

  const isRegistered = await TaskManager.isTaskRegisteredAsync(
    APPLE_HEALTH_SYNC_TASK
  );
  if (isRegistered) {
    await BackgroundFetch.unregisterTaskAsync(APPLE_HEALTH_SYNC_TASK);
  }
}
