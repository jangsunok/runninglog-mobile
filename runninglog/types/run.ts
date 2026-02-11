/**
 * 러닝 세션 및 GPS 트래킹 관련 타입
 */

export type RunStatus = 'idle' | 'running' | 'paused' | 'finished';

export interface Coordinate {
  latitude: number;
  longitude: number;
  /** Unix ms (optional, from LocationObject.timestamp) */
  timestamp?: number;
}

export interface LiveMetrics {
  /** 총 이동 거리 (m) */
  distanceMeters: number;
  /** 경과 시간 (ms) */
  durationMs: number;
  /** 현재 페이스 (min/km). 이동 거리 0이면 null */
  paceMinPerKm: number | null;
}

export interface RunSession {
  id: string;
  startedAt: number;
  /** 마지막으로 업데이트된 시각 (일시정지/재개 반영) */
  updatedAt: number;
  coordinates: Coordinate[];
  /** 총 이동 거리 (m) */
  totalDistanceMeters: number;
  /** 순수 이동 시간 (ms). 일시정지 구간 제외 옵션 가능 */
  totalDurationMs: number;
  status: RunStatus;
  /** 일시정지 누적 시간 (ms). duration = (now - startedAt) - pausedDurationMs */
  pausedDurationMs?: number;
}

/** 1분/500m 백업용 드래프트 (직렬화 저장) */
export interface RunSessionDraft {
  id: string;
  startedAt: number;
  updatedAt: number;
  coordinates: Coordinate[];
  totalDistanceMeters: number;
  totalDurationMs: number;
  status: RunStatus;
  pausedDurationMs?: number;
}

export interface RunRecord {
  id: string;
  startedAt: number;
  finishedAt: number;
  coordinates: Coordinate[];
  totalDistanceMeters: number;
  totalDurationMs: number;
  /** 평균 페이스 min/km */
  avgPaceMinPerKm: number;
}
