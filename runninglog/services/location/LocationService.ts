/**
 * 러닝용 위치 추적 서비스
 * - 백그라운드 태스크 등록은 backgroundLocationTask.ts에서 수행
 * - 이 모듈은 start/stop 및 권한 처리만 담당
 */

import * as Location from 'expo-location';
import { LOCATION_TASK_NAME } from './backgroundLocationTask';

const DEFAULT_OPTIONS: Location.LocationTaskOptions = {
  accuracy: Location.Accuracy.BestForNavigation,
  distanceInterval: 10,
  timeInterval: 5_000,
  showsBackgroundLocationIndicator: true,
};

let isTracking = false;

export async function requestLocationPermissions(): Promise<boolean> {
  const { status: foreground } = await Location.requestForegroundPermissionsAsync();
  if (foreground !== 'granted') return false;

  const { status: background } = await Location.requestBackgroundPermissionsAsync();
  if (background !== 'granted') {
    // 백그라운드 미허용 시에도 포그라운드만으로 진행 가능 (선택적)
    return true;
  }
  return true;
}

export async function startLocationUpdates(
  options: Partial<Location.LocationTaskOptions> = {}
): Promise<void> {
  if (isTracking) return;
  const canRun = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
  if (canRun) {
    isTracking = true;
    return;
  }

  await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
    ...DEFAULT_OPTIONS,
    ...options,
  });
  isTracking = true;
}

export async function stopLocationUpdates(): Promise<void> {
  if (!isTracking) return;
  await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
  isTracking = false;
}

export function isLocationTracking(): boolean {
  return isTracking;
}
