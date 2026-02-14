/**
 * Apple Health 동기화 훅 (iOS 전용)
 * - 권한 요청, 백그라운드 태스크 등록/해제, 수동 동기화
 */

import { useCallback, useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';

import { storage } from '@/lib/storage';
import {
  isAppleHealthAvailable,
  requestAppleHealthPermissions,
} from '@/services/health/appleHealthService';
import {
  performAppleHealthSync,
  registerAppleHealthSyncTask,
  unregisterAppleHealthSyncTask,
} from '@/services/health/backgroundHealthSyncTask';

const ENABLED_KEY = 'apple_health_enabled';
const LAST_SYNC_KEY = 'apple_health_last_sync';

export function useAppleHealthSync() {
  const available = isAppleHealthAvailable();
  const [enabled, setEnabled] = useState(
    () => available && storage.getBoolean(ENABLED_KEY) === true
  );
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(
    () => storage.getString(LAST_SYNC_KEY) ?? null
  );

  // 포그라운드 복귀 시 catch-up 동기화
  useEffect(() => {
    if (!enabled || Platform.OS !== 'ios') return;

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        performAppleHealthSync()
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

    const granted = await requestAppleHealthPermissions();
    if (!granted) return false;

    await registerAppleHealthSyncTask();
    storage.set(ENABLED_KEY, true);
    setEnabled(true);

    // 즉시 첫 동기화
    setSyncing(true);
    try {
      await performAppleHealthSync();
      setLastSync(storage.getString(LAST_SYNC_KEY) ?? null);
    } finally {
      setSyncing(false);
    }

    return true;
  }, [available]);

  const disable = useCallback(async () => {
    await unregisterAppleHealthSyncTask();
    storage.set(ENABLED_KEY, false);
    setEnabled(false);
  }, []);

  const syncNow = useCallback(async () => {
    if (!enabled) return;
    setSyncing(true);
    try {
      await performAppleHealthSync();
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
