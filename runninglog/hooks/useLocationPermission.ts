/**
 * 위치 권한 상태 및 요청 훅
 * - 러닝 기록을 위해 포그라운드/백그라운드 권한 처리
 * - 거절 시 설정 앱으로 이동 유도
 */

import { useState, useCallback, useEffect } from 'react';
import * as Location from 'expo-location';
import { Linking, Platform } from 'react-native';

export type LocationPermissionStatus =
  | 'undetermined'
  | 'granted'
  | 'denied'
  | 'restricted'
  | 'loading';

interface LocationPermissionState {
  /** 포그라운드 권한 상태 */
  foreground: LocationPermissionStatus;
  /** 백그라운드 권한 상태 (iOS: always 등) */
  background: LocationPermissionStatus;
  /** 러닝에 필요한 권한이 모두 허용됐는지 */
  canRun: boolean;
  /** 권한 요청 중 */
  isRequesting: boolean;
}

/**
 * 현재 권한 상태 조회 (다이얼로그 띄우지 않음)
 */
async function getPermissionState(): Promise<{
  foreground: LocationPermissionStatus;
  background: LocationPermissionStatus;
}> {
  const f = await Location.getForegroundPermissionsAsync();
  let background: LocationPermissionStatus = 'undetermined';
  if (Platform.OS !== 'web') {
    const b = await Location.getBackgroundPermissionsAsync();
    background = (b.status as LocationPermissionStatus) ?? 'undetermined';
  }
  return {
    foreground: (f.status as LocationPermissionStatus) ?? 'undetermined',
    background,
  };
}

/**
 * 설정 앱 열기 (앱 전용 설정 화면)
 */
export function openAppSettings(): void {
  Linking.openSettings();
}

export function useLocationPermission() {
  const [state, setState] = useState<LocationPermissionState>({
    foreground: 'loading',
    background: 'loading',
    canRun: false,
    isRequesting: false,
  });

  const refresh = useCallback(async () => {
    const { foreground, background } = await getPermissionState();
    const canRun = foreground === 'granted';
    setState((s) => ({
      ...s,
      foreground,
      background,
      canRun,
      isRequesting: false,
    }));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /** 포그라운드 + (가능하면) 백그라운드 권한 요청. 러닝 시작 전 호출 */
  const requestForRun = useCallback(async (): Promise<boolean> => {
    setState((s) => ({ ...s, isRequesting: true }));
    try {
      const f = await Location.requestForegroundPermissionsAsync();
      if (f.status !== 'granted') {
        setState((s) => ({
          ...s,
          foreground: f.status as LocationPermissionStatus,
          canRun: false,
          isRequesting: false,
        }));
        return false;
      }
      if (Platform.OS !== 'web') {
        const b = await Location.requestBackgroundPermissionsAsync();
        setState((s) => ({
          ...s,
          foreground: 'granted',
          background: (b.status as LocationPermissionStatus) ?? 'undetermined',
          canRun: true,
          isRequesting: false,
        }));
      } else {
        setState((s) => ({
          ...s,
          foreground: 'granted',
          canRun: true,
          isRequesting: false,
        }));
      }
      return true;
    } catch (e) {
      setState((s) => ({ ...s, isRequesting: false }));
      return false;
    }
  }, []);

  return {
    ...state,
    refresh,
    requestForRun,
    openAppSettings,
  };
}
