/**
 * 활동 목록 조회 훅 (Activity API)
 */

import { useEffect, useState, useCallback } from 'react';
import { getActivities } from '@/lib/api/activities';
import type { ActivitiesListResponse } from '@/types/activity';
import { ApiError } from '@/lib/api/client';

export interface UseActivitiesOptions {
  page?: number;
  pageSize?: number;
}

export function useActivities(options: UseActivitiesOptions = {}) {
  const { page = 1, pageSize = 10 } = options;
  const [data, setData] = useState<ActivitiesListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getActivities({ page, page_size: pageSize });
      setData(res);
    } catch (e) {
      const message = e instanceof ApiError ? e.message : '목록을 불러오지 못했습니다.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return { data, loading, error, refetch: fetchActivities };
}
