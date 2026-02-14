/**
 * MMKV 스토리지 싱글턴
 * - 앱 전역에서 사용되는 로컬 키-값 저장소
 */

import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV({ id: 'runninglog' });
