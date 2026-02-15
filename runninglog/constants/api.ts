/**
 * API 서버 설정
 * - .env에 EXPO_PUBLIC_API_HOST=http://localhost:8001 로 설정
 * - Android 에뮬레이터에서는 localhost를 10.0.2.2로 자동 변환
 * - 프로덕션: eas.json build.production.env 에 EXPO_PUBLIC_API_HOST=https://runninglog.life
 */
import { Platform } from 'react-native';

function resolveApiHost(): string {
  const host = process.env.EXPO_PUBLIC_API_HOST ?? 'https://runninglog.life';

  if (Platform.OS === 'android' && __DEV__) {
    return host.replace('://localhost', '://10.0.2.2');
  }

  return host;
}

const API_HOST = resolveApiHost();

export const API_BASE_URL = `${API_HOST}/api`;
export const SWAGGER_DOCS_URL = `${API_HOST}/api/docs/`;
