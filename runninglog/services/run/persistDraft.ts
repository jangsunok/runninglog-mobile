/**
 * 러닝 세션 드래프트 로컬 저장 (1분/500m 백업)
 * - MMKV 또는 AsyncStorage로 교체 가능
 * - Development Build에서만 사용 (expo-location 백그라운드 사용 시)
 */

import type { RunSessionDraft } from '@/types/run';

const DRAFT_KEY = 'running_session_draft';

// MMKV 사용 시: import { MMKV } from 'react-native-mmkv'; const storage = new MMKV();
// 현재는 메모리 + 나중에 AsyncStorage/MMKV 연동용 인터페이스
let memoryDraft: RunSessionDraft | null = null;

export function persistDraft(draft: RunSessionDraft | null): void {
  memoryDraft = draft;
  // TODO: MMKV 예시
  // import { storage } from '@/lib/storage'; storage.set(DRAFT_KEY, JSON.stringify(draft));
}

export function loadDraft(): RunSessionDraft | null {
  if (memoryDraft) return memoryDraft;
  // TODO: MMKV 예시
  // const raw = storage.getString(DRAFT_KEY); return raw ? JSON.parse(raw) : null;
  return null;
}
