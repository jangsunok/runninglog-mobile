/**
 * Apple HealthKit 서비스 (Android 스텁)
 * - Android에는 HealthKit이 없으므로 항상 비활성/빈 결과 반환
 */

import type { SyncActivityItem } from '@/types/activity';

export function isAppleHealthAvailable(): boolean {
  return false;
}

export async function requestAppleHealthPermissions(): Promise<boolean> {
  return false;
}

export async function fetchAppleHealthWorkouts(
  _sinceDate: Date
): Promise<SyncActivityItem[]> {
  return [];
}
