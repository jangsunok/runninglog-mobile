/**
 * 새 API 응답 타입 — 목표, 업적, 분석, 알림, 알림설정
 */

// ─── 목표 (Goals) ───────────────────────────────────────────

export type GoalType = 'DISTANCE' | 'TIME' | 'COUNT';

export interface Goal {
  id: number;
  year: number;
  month: number;
  goal_type: GoalType;
  target_value: number;
  current_value: number;
  progress_percent: number;
  is_achieved: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateGoalPayload {
  goal_type: GoalType;
  target_value: number;
}

export interface UpdateGoalPayload {
  target_value?: number;
  goal_type?: GoalType;
}

// ─── 업적 (Achievements) ────────────────────────────────────

export type DistanceType = '5K' | '10K' | 'HALF' | 'FULL';
export type MedalType = 'GOLD' | 'SILVER' | 'NONE';

export interface Achievement {
  id: number;
  distance_type: DistanceType;
  distance_type_display: string;
  best_time: string;
  best_time_display: string;
  medal_type: MedalType;
  is_personal_record: boolean;
  activity: number;
  created_at: string;
}

export interface AchievementsCurrentResponse {
  year: number;
  month: number;
  achievements: Achievement[];
}

export interface AchievementHistoryItem {
  year: number;
  month: number;
  gold_count: number;
  silver_count: number;
  total_records: number;
}

export interface AchievementsHistoryResponse {
  history: AchievementHistoryItem[];
}

// ─── 월간 분석 (Monthly Analysis) ───────────────────────────

export interface HeartRateZones {
  zone1: number;
  zone2: number;
  zone3: number;
  zone4: number;
  zone5: number;
}

export interface RecentMonthData {
  year: number;
  month: number;
  distance: number;
}

export interface MonthlyAnalysis {
  year: number;
  month: number;
  total_distance: number;
  distance_change_rate: number;
  total_run_count: number;
  total_duration_seconds: number;
  total_duration_display: string;
  total_calories: number;
  avg_pace: string;
  min_pace: string;
  max_pace: string;
  avg_heart_rate: number;
  heart_rate_zones: HeartRateZones;
  total_elevation_gain: number;
  avg_cadence: number;
  recent_months_data: RecentMonthData[];
}

export interface MonthlyAnalysisAI {
  year: number;
  month: number;
  ai_distance_comment: string;
  ai_pace_comment: string;
  ai_heart_rate_comment: string;
  ai_overall_comment: string;
  ai_generated_at: string;
}

export interface AvailableMonth {
  year: number;
  month: number;
}

// ─── 알림 (Notifications) ───────────────────────────────────

export type NotificationType =
  | 'ACHIEVEMENT'
  | 'GOAL_COMPLETE'
  | 'WEEKLY_SUMMARY'
  | 'COMMENT'
  | 'SERVICE_UPDATE'
  | 'MARKETING';

export interface Notification {
  id: number;
  notification_type: NotificationType;
  title: string;
  body: string;
  emoji: string;
  is_read: boolean;
  created_at: string;
  time_display: string;
  action_url: string | null;
  related_id: number | null;
}

export interface NotificationsListResponse {
  total_count: number;
  page: number;
  page_size: number;
  results: Notification[];
  unread_count: number;
}

export interface UnreadCountResponse {
  count: number;
}

export interface ReadAllResponse {
  success: boolean;
  updated_count: number;
}

// ─── 알림 설정 (Notification Settings) ──────────────────────

export interface NotificationSettings {
  push_enabled: boolean;
  marketing_enabled: boolean;
  night_push_enabled: boolean;
  gps_consent: boolean;
}

// ─── 사용자 프로필 수정 ─────────────────────────────────────

export type ThemePreference = 'system' | 'light' | 'dark';

export interface UpdateProfilePayload {
  nickname?: string;
  theme_preference?: ThemePreference;
}

export interface WithdrawResponse {
  success: boolean;
  message: string;
  deactivated_at: string;
}
