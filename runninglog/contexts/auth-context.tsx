'use client';

import { setAuthToken } from '@/lib/api/client';
import { logoutApi, refreshTokens } from '@/lib/api/auth';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'runninglog_access_token';
const REFRESH_TOKEN_KEY = 'runninglog_refresh_token';

const isWeb = Platform.OS === 'web';

function getWebStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

async function getStoredAccessToken(): Promise<string | null> {
  if (isWeb) {
    const s = getWebStorage();
    return s ? s.getItem(ACCESS_TOKEN_KEY) : null;
  }
  try {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

async function getStoredRefreshToken(): Promise<string | null> {
  if (isWeb) {
    const s = getWebStorage();
    return s ? s.getItem(REFRESH_TOKEN_KEY) : null;
  }
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

async function setStoredTokens(accessToken: string, refreshToken: string): Promise<void> {
  if (isWeb) {
    const s = getWebStorage();
    if (s) {
      s.setItem(ACCESS_TOKEN_KEY, accessToken);
      s.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
    return;
  }
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
}

async function removeStoredTokens(): Promise<void> {
  if (isWeb) {
    const s = getWebStorage();
    if (s) {
      s.removeItem(ACCESS_TOKEN_KEY);
      s.removeItem(REFRESH_TOKEN_KEY);
    }
    return;
  }
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

type AuthContextValue = {
  isReady: boolean;
  isLoggedIn: boolean;
  login: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkAuth = useCallback(async () => {
    try {
      const refresh = await getStoredRefreshToken();

      // 리프레시 토큰이 없으면 바로 비로그인 상태
      if (!refresh) {
        await removeStoredTokens();
        setAuthToken(null);
        setIsLoggedIn(false);
        return;
      }

      // 리프레시 토큰으로 세션 갱신 시도
      const refreshed = await refreshTokens(refresh);
      await setStoredTokens(refreshed.access_token, refreshed.refresh_token);
      setAuthToken(refreshed.access_token);
      setIsLoggedIn(true);
    } catch {
      // 갱신 실패 시 강제 로그아웃 처리
      await removeStoredTokens();
      setAuthToken(null);
      setIsLoggedIn(false);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (accessToken: string, refreshToken: string) => {
    await setStoredTokens(accessToken, refreshToken);
    setAuthToken(accessToken);
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(async () => {
    try {
      const refresh = await getStoredRefreshToken();
      if (refresh) {
        setAuthToken(await getStoredAccessToken());
        await logoutApi(refresh);
      }
    } catch {
      /* 서버 로그아웃 실패해도 로컬은 정리 */
    } finally {
      await removeStoredTokens();
      setAuthToken(null);
      setIsLoggedIn(false);
    }
  }, []);

  const value: AuthContextValue = { isReady, isLoggedIn, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
