/**
 * Notification Settings API — 알림 설정 조회/변경
 */

import { apiClient } from '@/lib/api/client';
import type { NotificationSettings } from '@/types/api';

const BASE = 'v1/settings/notifications';

/** 현재 알림 설정 — GET /v1/settings/notifications/ */
export async function getNotificationSettings(): Promise<NotificationSettings> {
  return apiClient<NotificationSettings>(`${BASE}/`);
}

/** 알림 설정 변경 — PATCH /v1/settings/notifications/ */
export async function updateNotificationSettings(
  payload: Partial<NotificationSettings>
): Promise<NotificationSettings> {
  return apiClient<NotificationSettings>(`${BASE}/`, {
    method: 'PATCH',
    body: payload,
  });
}
