import type { ActivityListItem, StatisticsSummary } from '@/types/activity';
import type { Goal } from '@/types/api';
import type { CoachingContext, TemplateVariables } from './types';

const GOAL_TYPE_LABELS: Record<string, string> = {
  DISTANCE: '거리',
  TIME: '시간',
  COUNT: '횟수',
};

export function computeCoachingContext(params: {
  activities: ActivityListItem[];
  statistics: StatisticsSummary | null;
  goal: Goal | null;
}): CoachingContext {
  const { activities, statistics, goal } = params;
  const now = new Date();

  const sorted = [...activities].sort(
    (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
  );
  const latest = sorted[0] ?? null;

  const weeklyRunCount = countInCurrentWeek(sorted, now);
  const monthlyRunCount = countInCurrentMonth(sorted, now);
  const daysSinceLastRun = latest ? diffCalendarDays(now, new Date(latest.started_at)) : -1;
  const consecutiveRunDays = computeStreak(sorted, now);
  const timeOfDay = getTimeOfDay(now.getHours());

  const variables = buildVariables({
    latest,
    statistics,
    goal,
    weeklyRunCount,
    monthlyRunCount,
    daysSinceLastRun,
    consecutiveRunDays,
    timeOfDay,
  });

  return {
    hasActivities: sorted.length > 0,
    latestActivity: latest,
    weeklyRunCount,
    monthlyRunCount,
    daysSinceLastRun,
    consecutiveRunDays,
    timeOfDay,
    dayOfWeek: now.getDay(),
    totalDistance: statistics?.total_distance_km ?? null,
    totalActivities: statistics?.total_activities ?? null,
    longestDistance: statistics?.longest_distance ?? null,
    goal,
    variables,
  };
}

// ─── Helpers ─────────────────────────────────────────────────

function countInCurrentWeek(sorted: ActivityListItem[], now: Date): number {
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - now.getDay());
  sunday.setHours(0, 0, 0, 0);

  const uniqueDays = new Set<string>();

  for (const a of sorted) {
    const d = new Date(a.started_at);
    if (d >= sunday) {
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      uniqueDays.add(key);
    }
  }

  return uniqueDays.size;
}

function countInCurrentMonth(sorted: ActivityListItem[], now: Date): number {
  const y = now.getFullYear();
  const m = now.getMonth();
  const uniqueDays = new Set<string>();

  for (const a of sorted) {
    const d = new Date(a.started_at);
    if (d.getFullYear() === y && d.getMonth() === m) {
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      uniqueDays.add(key);
    }
  }

  return uniqueDays.size;
}

function diffCalendarDays(a: Date, b: Date): number {
  const msPerDay = 86_400_000;
  const aDay = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const bDay = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return Math.round((aDay - bDay) / msPerDay);
}

function computeStreak(sorted: ActivityListItem[], now: Date): number {
  if (sorted.length === 0) return 0;

  const runDates = new Set<string>();
  for (const a of sorted) {
    const d = new Date(a.started_at);
    runDates.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  }

  const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  const ranToday = runDates.has(todayKey);

  let streak = ranToday ? 1 : 0;
  const startOffset = ranToday ? 1 : 1;

  for (let i = startOffset; i <= 365; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (runDates.has(key)) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

function getTimeOfDay(hour: number): CoachingContext['timeOfDay'] {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

function buildVariables(params: {
  latest: ActivityListItem | null;
  statistics: StatisticsSummary | null;
  goal: Goal | null;
  weeklyRunCount: number;
  monthlyRunCount: number;
  daysSinceLastRun: number;
  consecutiveRunDays: number;
  timeOfDay: CoachingContext['timeOfDay'];
}): TemplateVariables {
  const { latest, statistics, goal } = params;

  return {
    distance: latest?.distance_km?.toFixed(2) ?? '0',
    duration: latest?.duration_display ?? '00:00:00',
    pace: latest?.average_pace_display ?? '-',
    calories: latest?.calories?.toString() ?? '0',

    totalDistance: statistics?.total_distance_km?.toFixed(1) ?? '0',
    totalActivities: statistics?.total_activities?.toString() ?? '0',
    averagePace: statistics?.average_pace_display ?? '-',
    longestDistance: statistics?.longest_distance?.toFixed(1) ?? '0',

    weeklyCount: params.weeklyRunCount.toString(),
    monthlyCount: params.monthlyRunCount.toString(),
    daysSinceLastRun: Math.max(params.daysSinceLastRun, 0).toString(),
    streak: params.consecutiveRunDays.toString(),

    goalType: goal ? (GOAL_TYPE_LABELS[goal.goal_type] ?? '') : '',
    goalTarget: goal?.target_value?.toString() ?? '',
    goalCurrent: goal?.current_value?.toString() ?? '',
    goalProgress: goal?.progress_percent?.toString() ?? '0',
  };
}
