/**
 * expo-task-manager를 이용한 백그라운드 위치 추적 태스크
 *
 * - defineTask는 앱 로드 시 한 번 등록되어야 하므로
 *   app/_layout.tsx 또는 run/active.tsx 상단에서
 *   import '@/services/location/backgroundLocationTask' 로 불러와야 합니다.
 */

import * as TaskManager from 'expo-task-manager';
import type { LocationObject } from 'expo-location';
import { runStore } from '@/stores/runStore';

export const LOCATION_TASK_NAME = 'RUNNING_LOG_LOCATION';

interface LocationTaskData {
  locations: LocationObject[];
}

TaskManager.defineTask<LocationTaskData>(
  LOCATION_TASK_NAME,
  ({ data, error }: { data: LocationTaskData | null; error: Error | null }) => {
    if (error) {
      console.error('[backgroundLocationTask]', error);
      return;
    }
    if (!data?.locations?.length) return;

    const coordinates = data.locations.map((loc) => ({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      timestamp: loc.timestamp,
    }));

    runStore.getState().addLocations(coordinates);
  }
);
