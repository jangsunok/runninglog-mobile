/**
 * Strava / Garmin OAuth 연결 훅
 * - WebBrowser.openAuthSessionAsync로 OAuth 인증
 * - 딥링크 runninglog://data-source?service=...&status=... 로 결과 수신
 */

import { useCallback, useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { useLocalSearchParams } from 'expo-router';

import {
  type ConnectionStatus,
  disconnectGarmin,
  disconnectStrava,
  getConnectionStatus,
  getGarminAuthUrl,
  getStravaAuthUrl,
} from '@/lib/api/integrations';

type ServiceType = 'strava' | 'garmin';

interface OAuthConnectState {
  strava: ConnectionStatus | null;
  garmin: ConnectionStatus | null;
  loading: boolean;
  connecting: ServiceType | null;
}

export function useOAuthConnect() {
  const params = useLocalSearchParams<{
    service?: string;
    status?: string;
  }>();

  const [state, setState] = useState<OAuthConnectState>({
    strava: null,
    garmin: null,
    loading: true,
    connecting: null,
  });

  const fetchStatus = useCallback(async () => {
    try {
      const res = await getConnectionStatus();
      const strava =
        res.connections.find((c) => c.service === 'STRAVA' && c.is_active) ?? null;
      const garmin =
        res.connections.find((c) => c.service === 'GARMIN_CONNECT' && c.is_active) ?? null;
      setState((prev) => ({ ...prev, strava, garmin, loading: false }));
    } catch {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  // 초기 로드 + OAuth 콜백 결과 처리
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // 딥링크 파라미터로 OAuth 완료 감지
  useEffect(() => {
    if (params.service && params.status === 'success') {
      fetchStatus();
    }
  }, [params.service, params.status, fetchStatus]);

  const connect = useCallback(async (service: ServiceType) => {
    setState((prev) => ({ ...prev, connecting: service }));
    try {
      const { auth_url } =
        service === 'strava'
          ? await getStravaAuthUrl()
          : await getGarminAuthUrl();

      await WebBrowser.openAuthSessionAsync(auth_url, 'runninglog://data-source');
      // 콜백 후 상태 갱신
      await new Promise((resolve) => setTimeout(resolve, 500));
      const res = await getConnectionStatus();
      const strava =
        res.connections.find((c) => c.service === 'STRAVA' && c.is_active) ?? null;
      const garmin =
        res.connections.find((c) => c.service === 'GARMIN_CONNECT' && c.is_active) ?? null;
      setState((prev) => ({ ...prev, strava, garmin, connecting: null }));
    } catch {
      setState((prev) => ({ ...prev, connecting: null }));
    }
  }, []);

  const disconnect = useCallback(
    async (service: ServiceType) => {
      try {
        if (service === 'strava') {
          await disconnectStrava();
          setState((prev) => ({ ...prev, strava: null }));
        } else {
          await disconnectGarmin();
          setState((prev) => ({ ...prev, garmin: null }));
        }
      } catch {
        // 실패 시 무시 — UI에서 다시 시도
      }
    },
    []
  );

  return {
    strava: state.strava,
    garmin: state.garmin,
    loading: state.loading,
    connecting: state.connecting,
    connect,
    disconnect,
    refresh: fetchStatus,
  };
}
