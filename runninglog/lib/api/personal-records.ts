/**
 * Personal Records API — 개인 기록 목록
 */

import { apiClient } from '@/lib/api/client';
import type { PersonalRecordItem } from '@/types/activity';

export async function getPersonalRecords(): Promise<PersonalRecordItem[]> {
  return apiClient<PersonalRecordItem[]>('v1/personal-records/');
}
