/**
 * Monthly Analysis API — 월간 분석, AI 코칭
 */

import { apiClient } from '@/lib/api/client';
import type {
  MonthlyAnalysis,
  MonthlyAnalysisAI,
  AvailableMonth,
} from '@/types/api';

const BASE = 'v1/analysis';

/** 월간 분석 데이터 — GET /v1/analysis/monthly/?year=2025&month=1 */
export async function getMonthlyAnalysis(
  year: number,
  month: number
): Promise<MonthlyAnalysis> {
  return apiClient<MonthlyAnalysis>(
    `${BASE}/monthly/?year=${year}&month=${month}`
  );
}

/** AI 코칭 코멘트 — GET /v1/analysis/ai/?year=2025&month=1 */
export async function getAnalysisAI(
  year: number,
  month: number
): Promise<MonthlyAnalysisAI | null> {
  try {
    return await apiClient<MonthlyAnalysisAI>(
      `${BASE}/ai/?year=${year}&month=${month}`
    );
  } catch (e: any) {
    // 202: AI 분석 생성 중
    if (e.status === 202) return null;
    throw e;
  }
}

/** 분석 가능한 월 목록 — GET /v1/analysis/available-months/ */
export async function getAvailableMonths(): Promise<AvailableMonth[]> {
  return apiClient<AvailableMonth[]>(`${BASE}/available-months/`);
}
