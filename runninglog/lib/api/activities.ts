/**
 * Activity API — 활동 목록/상세/생성/수정/삭제
 * Base: /api/v1/, JWT: Authorization: Bearer <access_token>
 */

import { apiClient } from '@/lib/api/client';
import type {
  ActivitiesListParams,
  ActivitiesListResponse,
  ActivityDetail,
  CreateActivityPayload,
  CreateActivityResponse,
  UpdateActivityPayload,
} from '@/types/activity';
import type { RunRecord } from '@/types/run';
import { msToDurationHHMMSS, paceMinPerKmToDurationHHMMSS } from '@/lib/utils/activity-format';
import { computeSplits } from '@/lib/utils/geo';

const BASE = 'v1/activities';

export async function getActivities(
  params: ActivitiesListParams = {}
): Promise<ActivitiesListResponse> {
  const search = new URLSearchParams();
  if (params.page != null) search.set('page', String(params.page));
  if (params.page_size != null) search.set('page_size', String(params.page_size));
  if (params.from) search.set('from', params.from);
  if (params.to) search.set('to', params.to);
  const query = search.toString();
  const path = query ? `${BASE}/?${query}` : `${BASE}/`;
  return apiClient<ActivitiesListResponse>(path);
}

export async function getActivity(activityId: number): Promise<ActivityDetail> {
  return apiClient<ActivityDetail>(`${BASE}/${activityId}/`);
}

export async function createActivity(
  payload: CreateActivityPayload
): Promise<CreateActivityResponse> {
  return apiClient<CreateActivityResponse>(`${BASE}/`, {
    method: 'POST',
    body: payload,
  });
}

export async function updateActivity(
  activityId: number,
  payload: UpdateActivityPayload
): Promise<ActivityDetail> {
  return apiClient<ActivityDetail>(`${BASE}/${activityId}/`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function deleteActivity(activityId: number): Promise<void> {
  await apiClient(`${BASE}/${activityId}/`, { method: 'DELETE' });
}

/**
 * 로컬 RunRecord → API CreateActivityPayload 변환
 */
export function runRecordToCreatePayload(
  record: RunRecord,
  options?: { title?: string; notes?: string }
): CreateActivityPayload {
  const startedAt = new Date(record.startedAt).toISOString();
  const endedAt = new Date(record.finishedAt).toISOString();
  const route = record.coordinates.map((c) => ({
    lat: c.latitude,
    lng: c.longitude,
    ...(c.timestamp != null && { timestamp: c.timestamp }),
  }));
  const startCoord = record.coordinates[0];
  const endCoord = record.coordinates[record.coordinates.length - 1];

  const splitData = computeSplits(record.coordinates, record.totalDurationMs);
  const splits = splitData.map((sp) => ({
    split_number: sp.split_number,
    distance: sp.distance,
    duration: msToDurationHHMMSS(sp.durationMs),
    pace: paceMinPerKmToDurationHHMMSS(sp.paceMinPerKm),
  }));

  const bestSplit = splitData.length > 0
    ? splitData.reduce((best, sp) => sp.paceMinPerKm < best.paceMinPerKm ? sp : best)
    : null;

  return {
    title: options?.title ?? `러닝 ${new Date(record.startedAt).toLocaleDateString('ko-KR')}`,
    started_at: startedAt,
    ended_at: endedAt,
    duration: msToDurationHHMMSS(record.totalDurationMs),
    distance: record.totalDistanceMeters,
    average_pace: paceMinPerKmToDurationHHMMSS(record.avgPaceMinPerKm),
    best_pace: bestSplit
      ? paceMinPerKmToDurationHHMMSS(bestSplit.paceMinPerKm)
      : paceMinPerKmToDurationHHMMSS(record.avgPaceMinPerKm),
    route_coordinates: route.length ? route : undefined,
    start_coordinates: startCoord
      ? { lat: startCoord.latitude, lng: startCoord.longitude }
      : undefined,
    end_coordinates: endCoord
      ? { lat: endCoord.latitude, lng: endCoord.longitude }
      : undefined,
    splits: splits.length > 0 ? splits : undefined,
    notes: options?.notes,
  };
}

/**
 * 로컬 러닝 종료 후 서버에 활동 생성 (동기화)
 */
export async function createActivityFromRunRecord(
  record: RunRecord,
  options?: { title?: string; notes?: string }
): Promise<CreateActivityResponse> {
  const payload = runRecordToCreatePayload(record, options);
  return createActivity(payload);
}
