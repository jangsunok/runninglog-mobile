/**
 * Integration API — 외부 서비스 연동 (Strava, Garmin)
 */

import { apiClient } from '@/lib/api/client';

export interface ConnectionStatus {
  service: string;
  service_display: string;
  external_user_id: string;
  is_active: boolean;
  created_at: string;
}

export interface ConnectionStatusResponse {
  connections: ConnectionStatus[];
}

export interface OAuthUrlResponse {
  auth_url: string;
}

export async function getConnectionStatus(): Promise<ConnectionStatusResponse> {
  return apiClient<ConnectionStatusResponse>('v1/integrations/status/');
}

export async function getStravaAuthUrl(): Promise<OAuthUrlResponse> {
  return apiClient<OAuthUrlResponse>('v1/integrations/strava/auth/');
}

export async function disconnectStrava(): Promise<void> {
  await apiClient('v1/integrations/strava/disconnect/', { method: 'POST' });
}

export async function getGarminAuthUrl(): Promise<OAuthUrlResponse> {
  return apiClient<OAuthUrlResponse>('v1/integrations/garmin/auth/');
}

export async function disconnectGarmin(): Promise<void> {
  await apiClient('v1/integrations/garmin/disconnect/', { method: 'POST' });
}
