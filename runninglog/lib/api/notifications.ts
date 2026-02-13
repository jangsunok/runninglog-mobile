/**
 * Notifications API — 알림 목록, 읽음 처리
 */

import { apiClient } from '@/lib/api/client';
import type {
  NotificationsListResponse,
  UnreadCountResponse,
  ReadAllResponse,
} from '@/types/api';

const BASE = 'v1/notifications';

/** 알림 목록 — GET /v1/notifications/?page=1&page_size=20 */
export async function getNotifications(
  page = 1,
  pageSize = 20
): Promise<NotificationsListResponse> {
  return apiClient<NotificationsListResponse>(
    `${BASE}/?page=${page}&page_size=${pageSize}`
  );
}

/** 읽지 않은 알림 수 — GET /v1/notifications/unread-count/ */
export async function getUnreadCount(): Promise<number> {
  const data = await apiClient<UnreadCountResponse>(`${BASE}/unread-count/`);
  return data.count;
}

/** 단일 알림 읽음 — PATCH /v1/notifications/{id}/read/ */
export async function markNotificationRead(notificationId: number): Promise<void> {
  await apiClient(`${BASE}/${notificationId}/read/`, { method: 'PATCH' });
}

/** 전체 읽음 — POST /v1/notifications/read-all/ */
export async function markAllNotificationsRead(): Promise<ReadAllResponse> {
  return apiClient<ReadAllResponse>(`${BASE}/read-all/`, { method: 'POST' });
}
