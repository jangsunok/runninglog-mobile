/**
 * Achievements API — 업적/메달
 */

import { apiClient } from '@/lib/api/client';
import type {
  AchievementsCurrentResponse,
  AchievementsHistoryResponse,
} from '@/types/api';

const BASE = 'v1/achievements';

/** 이번 달 업적 — GET /v1/achievements/current/ */
export async function getCurrentAchievements(): Promise<AchievementsCurrentResponse> {
  return apiClient<AchievementsCurrentResponse>(`${BASE}/current/`);
}

/** 특정 월 업적 — GET /v1/achievements/?year=2025&month=1 */
export async function getAchievements(
  year: number,
  month: number
): Promise<AchievementsCurrentResponse> {
  return apiClient<AchievementsCurrentResponse>(
    `${BASE}/?year=${year}&month=${month}`
  );
}

/** 월별 업적 히스토리 — GET /v1/achievements/history/ */
export async function getAchievementsHistory(): Promise<AchievementsHistoryResponse> {
  return apiClient<AchievementsHistoryResponse>(`${BASE}/history/`);
}
