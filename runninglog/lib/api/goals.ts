/**
 * Goals API — 이달의 목표 CRUD
 */

import { apiClient } from '@/lib/api/client';
import type { Goal, CreateGoalPayload, UpdateGoalPayload } from '@/types/api';

const BASE = 'v1/goals';

/** 이번 달 목표 조회 — GET /v1/goals/current/ */
export async function getCurrentGoal(): Promise<Goal | null> {
  try {
    return await apiClient<Goal>(`${BASE}/current/`);
  } catch (e: any) {
    if (e.status === 404) return null;
    throw e;
  }
}

/** 목표 생성 (이미 존재하면 업데이트) — POST /v1/goals/ */
export async function createGoal(payload: CreateGoalPayload): Promise<Goal> {
  return apiClient<Goal>(`${BASE}/`, { method: 'POST', body: payload });
}

/** 목표 수정 — PATCH /v1/goals/{id}/ */
export async function updateGoal(goalId: number, payload: UpdateGoalPayload): Promise<Goal> {
  return apiClient<Goal>(`${BASE}/${goalId}/`, { method: 'PATCH', body: payload });
}

/** 목표 삭제 — DELETE /v1/goals/{id}/ */
export async function deleteGoal(goalId: number): Promise<void> {
  await apiClient(`${BASE}/${goalId}/`, { method: 'DELETE' });
}
