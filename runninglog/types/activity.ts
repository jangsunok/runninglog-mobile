/**
 * Activity API 스펙 기반 타입
 * Base: /api/v1/, 인증: Authorization: Bearer <access_token>
 */

/** API 좌표 (lat/lng) */
export interface ApiCoordinate {
  lat: number;
  lng: number;
}

/** API 경로 좌표 (route_coordinates) */
export type RouteCoordinateItem = ApiCoordinate;

/** 목록 조회 쿼리 */
export interface ActivitiesListParams {
  page?: number;
  page_size?: number;
  /** 기간 필터 (YYYY-MM-DD). 포함 시 해당 기간 내 활동만 조회 */
  from?: string;
  to?: string;
}

/** 목록 조회 응답 */
export interface ActivitiesListResponse {
  total_count: number;
  page: number;
  page_size: number;
  next_page: number | null;
  previous_page: number | null;
  results: ActivityListItem[];
}

/** 목록 항목 */
export interface ActivityListItem {
  activity_id: number;
  title: string;
  started_at: string;
  distance: number;
  distance_km: number;
  duration: string;
  duration_display: string;
  average_pace: string;
  average_pace_display: string;
  calories: number;
  data_source: DataSource;
}

/** 상세 조회 응답 */
export interface ActivityDetail {
  activity_id: number;
  title: string;
  started_at: string;
  ended_at: string;
  distance: number;
  distance_km: number;
  duration: string;
  duration_display: string;
  average_pace: string;
  average_pace_display: string;
  best_pace: string;
  best_pace_display: string;
  calories: number;
  average_heart_rate: number | null;
  max_heart_rate: number | null;
  average_cadence: number | null;
  elevation_gain: number | null;
  elevation_loss: number | null;
  data_source: DataSource;
  notes: string;
  splits: ActivitySplit[];
  photos: ActivityPhoto[];
  route_coordinates: [number, number][] | ApiCoordinate[];
  start_coordinates: ApiCoordinate;
  end_coordinates: ApiCoordinate;
  created_at: string;
  updated_at: string;
}

export interface ActivitySplit {
  split_number: number;
  distance: number;
  duration: string;
  pace: string;
  pace_display: string;
  elevation_change?: number;
  average_heart_rate?: number;
}

export interface ActivityPhoto {
  photo_id: number;
  photo_url: string;
  captured_at: string;
  order: number;
}

/** 활동 생성 요청 Body */
export interface CreateActivityPayload {
  title?: string;
  started_at: string;
  ended_at: string;
  duration: string;
  distance: number;
  average_pace: string;
  best_pace?: string;
  calories?: number;
  average_heart_rate?: number;
  max_heart_rate?: number;
  average_cadence?: number;
  elevation_gain?: number;
  elevation_loss?: number;
  notes?: string;
  route_coordinates?: ApiCoordinate[];
  start_coordinates?: ApiCoordinate;
  end_coordinates?: ApiCoordinate;
  splits?: CreateActivitySplit[];
}

export interface CreateActivitySplit {
  split_number: number;
  distance: number;
  duration: string;
  pace: string;
  average_heart_rate?: number;
}

/** 활동 수정 요청 (일부 필드만) */
export interface UpdateActivityPayload {
  title?: string;
  notes?: string;
}

/** 활동 생성 응답 (상세와 동일 구조) */
export type CreateActivityResponse = ActivityDetail;

export type DataSource = 'APP' | 'SAMSUNG_HEALTH' | 'APPLE_HEALTH' | 'STRAVA' | 'GARMIN_CONNECT';

/** 동기화 요청 Body */
export interface SyncActivitiesPayload {
  activities: SyncActivityItem[];
}

export interface SyncActivityItem {
  external_id: string;
  started_at: string;
  ended_at: string;
  duration_seconds: number;
  distance_meters: number;
  calories?: number;
  average_heart_rate?: number;
  max_heart_rate?: number;
  average_cadence?: number;
  elevation_gain?: number;
  elevation_loss?: number;
  route_coordinates?: Array<{ lat: number; lng: number; altitude?: number; timestamp?: string }>;
  splits?: Array<{ split_number: number; duration_seconds: number; distance_meters: number }>;
}

export interface SyncResultItem {
  external_id: string;
  status: 'created' | 'duplicate' | 'overlap' | 'failed';
  activity_id: number;
}

export interface SyncResponse {
  results: SyncResultItem[];
}

export interface SyncLogItem {
  id: number;
  data_source: string;
  external_id: string;
  status: string;
  activity: number;
  error_message: string;
  synced_at: string;
}

/** 통계 요약 */
export interface StatisticsSummary {
  total_distance: number;
  total_distance_km: number;
  total_duration: string;
  total_duration_display: string;
  total_activities: number;
  total_calories: number;
  average_pace: string;
  average_pace_display: string;
  average_distance: number;
  longest_distance: number;
  total_elevation_gain: number;
}

/** 일/주/월/연 통계 항목 */
export interface StatisticsPeriodItem {
  period_start: string;
  period_end: string;
  total_distance: number;
  total_distance_km: number;
  total_duration: string;
  total_activities: number;
  total_calories: number;
  average_pace: string;
  average_pace_display: string;
  average_distance: number;
  longest_distance: number;
  total_elevation_gain: number;
}

/** 개인 기록 */
export interface PersonalRecordItem {
  id: number;
  record_type: string;
  record_type_display: string;
  activity: number;
  value: number;
  value_display: string;
  achieved_at: string;
  previous_value: number | null;
}

/** API 에러 응답 */
export interface ApiErrorResponse {
  error: string;
}
