import type { ActivityListItem } from '@/types/activity';
import type { Goal } from '@/types/api';

/** 멘트 템플릿에 삽입 가능한 동적 변수 */
export interface TemplateVariables {
  [key: string]: string;
  /** 최근 러닝 거리 (e.g. "5.23") */
  distance: string;
  /** 최근 러닝 시간 (e.g. "00:32:15") */
  duration: string;
  /** 최근 평균 페이스 (e.g. "6'11\"") */
  pace: string;
  /** 최근 칼로리 (e.g. "320") */
  calories: string;

  /** 누적 거리 (e.g. "142.5") */
  totalDistance: string;
  /** 총 러닝 횟수 (e.g. "48") */
  totalActivities: string;
  /** 최장 거리 (e.g. "21.1") */
  longestDistance: string;
  /** 전체 평균 페이스 (e.g. "5'45\"") */
  averagePace: string;

  /** 이번 주 러닝 횟수 (e.g. "3") */
  weeklyCount: string;
  /** 이번 달 러닝 횟수 (e.g. "12") */
  monthlyCount: string;
  /** 마지막 러닝 후 경과일 (e.g. "2") */
  daysSinceLastRun: string;
  /** 연속 러닝일 (e.g. "5") */
  streak: string;

  /** 목표 타입 표시 (e.g. "거리" | "시간" | "횟수" | "") */
  goalType: string;
  /** 목표 목푯값 (e.g. "100") */
  goalTarget: string;
  /** 목표 현재값 (e.g. "72.5") */
  goalCurrent: string;
  /** 목표 진행률 (e.g. "73") */
  goalProgress: string;
}

/** 룰 엔진이 조건 평가에 사용하는 구조화된 컨텍스트 */
export interface CoachingContext {
  hasActivities: boolean;
  latestActivity: ActivityListItem | null;

  weeklyRunCount: number;
  monthlyRunCount: number;
  /** 마지막 러닝 후 경과일. 0 = 오늘, -1 = 기록 없음 */
  daysSinceLastRun: number;
  consecutiveRunDays: number;

  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: number;

  totalDistance: number | null;
  totalActivities: number | null;
  longestDistance: number | null;

  goal: Goal | null;

  variables: TemplateVariables;
}

/** 코칭 룰 정의 */
export interface CoachingRule {
  id: string;
  category: string;
  /** 낮을수록 우선 평가. 첫 매칭 룰의 메시지를 사용 */
  priority: number;
  condition: (ctx: CoachingContext) => boolean;
  /** 동일 조건에 대한 메시지 변형 목록. 하루 단위로 랜덤 선택 */
  messages: string[];
}
