/**
 * Statistics API — 전체 요약, 일/주/월/연별 통계
 */

import { apiClient } from '@/lib/api/client';
import type {
  StatisticsSummary,
  StatisticsPeriodItem,
} from '@/types/activity';

export async function getStatisticsSummary(): Promise<StatisticsSummary> {
  return apiClient<StatisticsSummary>('v1/statistics/summary/');
}

export async function getStatisticsDaily(
  from: string,
  to: string
): Promise<StatisticsPeriodItem[]> {
  const params = new URLSearchParams({ from, to });
  return apiClient<StatisticsPeriodItem[]>(
    `v1/statistics/daily/?${params.toString()}`
  );
}

export async function getStatisticsWeekly(
  year: number
): Promise<StatisticsPeriodItem[]> {
  return apiClient<StatisticsPeriodItem[]>(
    `v1/statistics/weekly/?year=${year}`
  );
}

export async function getStatisticsMonthly(
  year: number
): Promise<StatisticsPeriodItem[]> {
  return apiClient<StatisticsPeriodItem[]>(
    `v1/statistics/monthly/?year=${year}`
  );
}

export async function getStatisticsYearly(): Promise<StatisticsPeriodItem[]> {
  return apiClient<StatisticsPeriodItem[]>('v1/statistics/yearly/');
}
