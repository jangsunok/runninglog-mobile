/**
 * API 서버 설정
 * - 로컬 기본값: http://localhost:8000 (EXPO_PUBLIC_API_HOST 없을 때)
 * - 프로덕션: eas.json build.production.env 에 EXPO_PUBLIC_API_HOST=https://runninglog.life
 * - Android 에뮬레이터: .env 에 EXPO_PUBLIC_API_HOST=http://10.0.2.2:8000
 */

const API_HOST =
  process.env.EXPO_PUBLIC_API_HOST ?? 'https://runninglog.life';

export const API_BASE_URL = `${API_HOST}/api`;
export const SWAGGER_DOCS_URL = `${API_HOST}/api/docs/`;
