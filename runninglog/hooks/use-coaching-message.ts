import { useCallback, useEffect, useState } from 'react';
import type { ActivityListItem } from '@/types/activity';
import { getStatisticsSummary } from '@/lib/api/statistics';
import { getCurrentGoal } from '@/lib/api/goals';
import { computeCoachingContext, getCoachingMessage } from '@/lib/coaching';

/**
 * 사용자의 활동 데이터를 기반으로 코칭 메시지를 계산하는 훅.
 * 홈 화면에서 이미 fetch한 activities를 받고,
 * statistics/goal은 내부에서 병렬 fetch한다.
 */
export function useCoachingMessage(activities: ActivityListItem[]): string {
  const [message, setMessage] = useState('');

  const compute = useCallback(async () => {
    try {
      const [statistics, goal] = await Promise.all([
        getStatisticsSummary().catch(() => null),
        getCurrentGoal().catch(() => null),
      ]);

      const context = computeCoachingContext({ activities, statistics, goal });
      setMessage(getCoachingMessage(context));
    } catch {
      setMessage('오늘도 로기와 함께해요!');
    }
  }, [activities]);

  useEffect(() => {
    compute();
  }, [compute]);

  return message;
}
