/**
 * Samsung Health (Health Connect) 동기화 훅 (Android 전용)
 * - 권한 요청, 백그라운드 태스크 등록/해제, 수동 동기화
 */

import { useCallback, useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';

import { storage } from '@/lib/storage';
import {
  isSamsungHealthAvailable,
  requestSamsungHealthPermissions,
} from '@/services/health/samsungHealthService';
import {
  performSamsungHealthSync,
  registerSamsungHealthSyncTask,
  unregisterSamsungHealthSyncTask,
} from '@/services/health/backgroundSamsungHealthSyncTask';

const ENABLED_KEY = 'samsung_health_enabled';
const LAST_SYNC_KEY = 'samsung_health_last_sync';

export function useSamsungHealthSync() {
  const [available, setAvailable] = useState(false);
  const [enabled, setEnabled] = useState(
    () => Platform.OS === 'android' && storage.getBoolean(ENABLED_KEY) === true
  );
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(
    () => storage.getString(LAST_SYNC_KEY) ?? null
  );

  // Health Connect SDK 가용성 체크
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    isSamsungHealthAvailable().then(setAvailable);
  }, []);

  // 포그라운드 복귀 시 catch-up 동기화
  useEffect(() => {
    if (!enabled || Platform.OS !== 'android') return;

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        performSamsungHealthSync()
          .then(() =>
            setLastSync(storage.getString(LAST_SYNC_KEY) ?? null)
          )
          .catch(() => {});
      }
    });
    return () => subscription.remove();
  }, [enabled]);

  const enable = useCallback(async (): Promise<boolean> => {
    if (!available) return false;

    const granted = await requestSamsungHealthPermissions();
    if (!granted) return false;

    await registerSamsungHealthSyncTask();
    storage.set(ENABLED_KEY, true);
    setEnabled(true);

    // 즉시 첫 동기화
    setSyncing(true);
    try {
      await performSamsungHealthSync();
      setLastSync(storage.getString(LAST_SYNC_KEY) ?? null);
    } finally {
      setSyncing(false);
    }

    return true;
  }, [available]);

  const disable = useCallback(async () => {
    await unregisterSamsungHealthSyncTask();
    storage.set(ENABLED_KEY, false);
    setEnabled(false);
  }, []);

  const syncNow = useCallback(async () => {
    if (!enabled) return;
    setSyncing(true);
    try {
      await performSamsungHealthSync();
      setLastSync(storage.getString(LAST_SYNC_KEY) ?? null);
    } finally {
      setSyncing(false);
    }
  }, [enabled]);

  return {
    available,
    enabled,
    syncing,
    lastSync,
    enable,
    disable,
    syncNow,
  };
}
