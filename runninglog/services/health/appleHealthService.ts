/**
 * Apple Health 서비스 진입점
 * - iOS: appleHealthService.ios.ts
 * - Android/기타: appleHealthService.android.ts (스텁)
 */

export {
  isAppleHealthAvailable,
  requestAppleHealthPermissions,
  fetchAppleHealthWorkouts,
} from './appleHealthService.android';
