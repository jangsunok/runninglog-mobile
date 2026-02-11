/**
 * 러닝 세션 상태 관리 (Zustand)
 * - Running / Paused / Finished 상태 및 데이터 흐름
 * - 1분 또는 500m마다 드래프트 로컬 저장 (데이터 유실 방지)
 */

import { create } from 'zustand';
import type {
  RunStatus,
  Coordinate,
  LiveMetrics,
  RunSession,
  RunSessionDraft,
  RunRecord,
} from '@/types/run';
import {
  totalDistanceMeters as computeTotalDistanceMeters,
  paceMinPerKm,
} from '@/lib/utils/geo';
import { persistDraft, loadDraft } from '@/services/run/persistDraft';

const PERSIST_INTERVAL_MS = 60_000; // 1분
const PERSIST_DISTANCE_M = 500;

interface RunState {
  status: RunStatus;
  currentSession: RunSession | null;
  liveMetrics: LiveMetrics;
  /** 완료된 러닝 목록 (로컬 캐시, 서버 동기화 후보) */
  history: RunRecord[];
  /** 1분/500m 드래프트 저장 시점 추적 */
  _lastPersistAt: number;
  _distanceAtLastPersist: number;

  // Actions
  startRun: () => void;
  pauseRun: () => void;
  resumeRun: () => void;
  finishRun: () => RunRecord | null;
  addLocations: (coordinates: Coordinate[]) => void;
  reset: () => void;
  /** 앱 재시작 시 드래프트 복구 */
  restoreDraftIfNeeded: () => RunSession | null;
}

const emptyMetrics: LiveMetrics = {
  distanceMeters: 0,
  durationMs: 0,
  paceMinPerKm: null,
};

function createSession(): RunSession {
  return {
    id: `run_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    startedAt: Date.now(),
    updatedAt: Date.now(),
    coordinates: [],
    totalDistanceMeters: 0,
    totalDurationMs: 0,
    status: 'running',
    pausedDurationMs: 0,
  };
}

export const runStore = create<RunState>((set, get) => ({
  status: 'idle',
  currentSession: null,
  liveMetrics: emptyMetrics,
  history: [],
  _lastPersistAt: 0,
  _distanceAtLastPersist: 0,

  startRun: () => {
    const session = createSession();
    const now = Date.now();
    set({
      status: 'running',
      currentSession: session,
      liveMetrics: { ...emptyMetrics },
      _lastPersistAt: now,
      _distanceAtLastPersist: 0,
    });
  },

  pauseRun: () => {
    const { currentSession } = get();
    if (!currentSession || currentSession.status !== 'running') return;
    const now = Date.now();
    const updated: RunSession = {
      ...currentSession,
      status: 'paused',
      updatedAt: now,
    };
    set({
      status: 'paused',
      currentSession: updated,
    });
  },

  resumeRun: () => {
    const { currentSession } = get();
    if (!currentSession || currentSession.status !== 'paused') return;
    const now = Date.now();
    const updated: RunSession = {
      ...currentSession,
      status: 'running',
      updatedAt: now,
      pausedDurationMs: (currentSession.pausedDurationMs ?? 0) + (now - currentSession.updatedAt),
    };
    set({
      status: 'running',
      currentSession: updated,
    });
  },

  finishRun: () => {
    const { currentSession } = get();
    if (!currentSession) return null;
    const now = Date.now();
    const totalDurationMs =
      now -
      currentSession.startedAt -
      (currentSession.pausedDurationMs ?? 0);
    const distance = currentSession.totalDistanceMeters;
    const record: RunRecord = {
      id: currentSession.id,
      startedAt: currentSession.startedAt,
      finishedAt: now,
      coordinates: [...currentSession.coordinates],
      totalDistanceMeters: distance,
      totalDurationMs,
      avgPaceMinPerKm: paceMinPerKm(distance, totalDurationMs) ?? 0,
    };
    set((state) => ({
      status: 'idle',
      currentSession: null,
      liveMetrics: emptyMetrics,
      history: [record, ...state.history],
    }));
    persistDraft(null);
    return record;
  },

  addLocations: (coordinates: Coordinate[]) => {
    const { currentSession, status } = get();
    if (!currentSession || (status !== 'running')) return;

    const prevCoords = currentSession.coordinates;
    const lastStored = prevCoords[prevCoords.length - 1];
    const appended = lastStored
      ? [...prevCoords, ...coordinates]
      : [...coordinates];
    const totalDistanceMeters = computeTotalDistanceMeters(appended);
    const now = Date.now();
    const pausedMs = currentSession.pausedDurationMs ?? 0;
    const totalDurationMs = now - currentSession.startedAt - pausedMs;
    const paceMinPerKmValue = paceMinPerKm(totalDistanceMeters, totalDurationMs);

    const updated: RunSession = {
      ...currentSession,
      coordinates: appended,
      totalDistanceMeters,
      totalDurationMs,
      updatedAt: now,
    };

    set({
      currentSession: updated,
      liveMetrics: {
        distanceMeters: totalDistanceMeters,
        durationMs: totalDurationMs,
        paceMinPerKm: paceMinPerKmValue,
      },
    });

    // 1분 또는 500m마다 드래프트 저장
    const { _lastPersistAt, _distanceAtLastPersist } = get();
    const distanceSincePersist = totalDistanceMeters - _distanceAtLastPersist;
    if (
      now - _lastPersistAt >= PERSIST_INTERVAL_MS ||
      distanceSincePersist >= PERSIST_DISTANCE_M
    ) {
      const draft: RunSessionDraft = {
        id: updated.id,
        startedAt: updated.startedAt,
        updatedAt: updated.updatedAt,
        coordinates: updated.coordinates,
        totalDistanceMeters: updated.totalDistanceMeters,
        totalDurationMs: updated.totalDurationMs,
        status: updated.status,
        pausedDurationMs: updated.pausedDurationMs,
      };
      persistDraft(draft);
      set({ _lastPersistAt: now, _distanceAtLastPersist: totalDistanceMeters });
    }
  },

  reset: () => {
    set({
      status: 'idle',
      currentSession: null,
      liveMetrics: emptyMetrics,
      _lastPersistAt: 0,
      _distanceAtLastPersist: 0,
    });
    persistDraft(null);
  },

  restoreDraftIfNeeded: () => {
    const draft = loadDraft();
    if (!draft || (draft.status !== 'running' && draft.status !== 'paused')) return null;
    const session: RunSession = {
      ...draft,
      pausedDurationMs: draft.pausedDurationMs ?? 0,
    };
    set({
      status: draft.status,
      currentSession: session,
      liveMetrics: {
        distanceMeters: draft.totalDistanceMeters,
        durationMs: draft.totalDurationMs,
        paceMinPerKm: paceMinPerKm(draft.totalDistanceMeters, draft.totalDurationMs),
      },
    });
    return session;
  },
}));
