/**
 * Sync API — 외부 앱 동기화 (삼성헬스, 애플건강), 동기화 로그
 */

import { apiClient } from '@/lib/api/client';
import type {
  SyncActivitiesPayload,
  SyncResponse,
  SyncLogItem,
} from '@/types/activity';

export async function syncSamsungHealth(
  payload: SyncActivitiesPayload
): Promise<SyncResponse> {
  return apiClient<SyncResponse>('v1/sync/samsung-health/', {
    method: 'POST',
    body: payload,
  });
}

export async function syncAppleHealth(
  payload: SyncActivitiesPayload
): Promise<SyncResponse> {
  return apiClient<SyncResponse>('v1/sync/apple-health/', {
    method: 'POST',
    body: payload,
  });
}

export async function getSyncLogs(): Promise<SyncLogItem[]> {
  return apiClient<SyncLogItem[]>('v1/sync/logs/');
}
