/**
 * runStore 구독용 셀렉터 (리렌더 최소화)
 */

import { useShallow } from 'zustand/react/shallow';
import { runStore } from './runStore';

export function useRunStore() {
  return runStore(
    useShallow((s) => ({
      status: s.status,
      currentSession: s.currentSession,
      liveMetrics: s.liveMetrics,
      distanceMeters: s.liveMetrics.distanceMeters,
      durationMs: s.liveMetrics.durationMs,
      paceMinPerKm: s.liveMetrics.paceMinPerKm,
      startRun: s.startRun,
      pauseRun: s.pauseRun,
      resumeRun: s.resumeRun,
      finishRun: s.finishRun,
      addLocations: s.addLocations,
      reset: s.reset,
      restoreDraftIfNeeded: s.restoreDraftIfNeeded,
    }))
  );
}
