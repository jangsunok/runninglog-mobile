/**
 * 로컬 러닝 종료 후 서버에 활동 생성 (동기화) 훅
 * run/active 화면에서 finishRun() 직후 createActivityFromRunRecord 호출용
 */

import { useState, useCallback } from 'react';
import { createActivityFromRunRecord } from '@/lib/api/activities';
import type { RunRecord } from '@/types/run';
import type { CreateActivityResponse } from '@/types/activity';
import { ApiError } from '@/lib/api/client';

export function useSyncRunToServer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sync = useCallback(
    async (
      record: RunRecord,
      options?: { title?: string; notes?: string }
    ): Promise<CreateActivityResponse | null> => {
      setLoading(true);
      setError(null);
      try {
        const activity = await createActivityFromRunRecord(record, options);
        return activity;
      } catch (e) {
        const message = e instanceof ApiError ? e.message : '서버에 저장하지 못했습니다.';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { sync, loading, error };
}
