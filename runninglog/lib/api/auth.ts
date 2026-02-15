/**
 * 모바일 JWT 인증 API
 * - POST /api/v1/mobile/auth/login/ {email, password} → {user, access_token, refresh_token}
 * - POST /api/v1/mobile/auth/kakao/ {kakao_access_token} → {user, access_token, refresh_token}
 * - POST /api/v1/mobile/auth/token/refresh/ {refresh_token} → {access_token, refresh_token}
 * - GET /api/v1/mobile/auth/me/ (Bearer) → {user}
 * - POST /api/v1/mobile/auth/logout/ (Bearer) {refresh_token} → {message}
 */

import { ApiError, apiClient } from '@/lib/api/client';

const BASE = '/v1/mobile/auth';

export type AuthTokens = {
  access_token: string;
  refresh_token: string;
};

export type User = {
  id: number;
  email: string;
  nickname?: string;
  profile_image_url?: string;
  following_count?: number;
  followers_count?: number;
  theme_preference?: 'system' | 'light' | 'dark';
  is_active?: boolean;
  created_at?: string;
  last_login?: string;
};

export type LoginResponse = {
  user: User;
  access_token: string;
  refresh_token: string;
};

export type RefreshResponse = {
  access_token: string;
  refresh_token: string;
};

/** 이메일 로그인 — POST /v1/mobile/auth/login/ */
export async function loginWithEmail(email: string, password: string): Promise<LoginResponse> {
  const data = await apiClient<LoginResponse>(`${BASE}/login/`, {
    method: 'POST',
    body: { email, password },
    auth: false,
  });
  if (!data.access_token || !data.refresh_token) {
    throw new Error('로그인 응답에 토큰이 없습니다.');
  }
  return data;
}

/** 카카오 로그인 — POST /v1/mobile/auth/kakao/ */
export async function loginWithKakao(kakaoAccessToken: string): Promise<LoginResponse> {
  const data = await apiClient<LoginResponse>(`${BASE}/kakao/`, {
    method: 'POST',
    body: { kakao_access_token: kakaoAccessToken },
    auth: false,
  });
  if (!data.access_token || !data.refresh_token) {
    throw new Error('로그인 응답에 토큰이 없습니다.');
  }
  return data;
}


/** 토큰 갱신 — POST /v1/mobile/auth/token/refresh/ */
export async function refreshTokens(refreshToken: string): Promise<RefreshResponse> {
  const data = await apiClient<RefreshResponse>(`${BASE}/token/refresh/`, {
    method: 'POST',
    body: { refresh_token: refreshToken },
    auth: false,
  });
  if (!data.access_token || !data.refresh_token) {
    throw new Error('토큰 갱신 응답이 올바르지 않습니다.');
  }
  return data;
}

/** 현재 사용자 — GET /v1/mobile/auth/me/ (Bearer) */
export async function getCurrentUser(): Promise<User> {
  return apiClient<User>(`${BASE}/me/`, { auth: true });
}

/** 사용자 정보 수정 — PATCH /v1/mobile/auth/me/ */
export async function updateProfile(
  payload: { nickname?: string; theme_preference?: string }
): Promise<User> {
  return apiClient<User>(`${BASE}/me/`, {
    method: 'PATCH',
    body: payload,
    auth: true,
  });
}

/** 계정 탈퇴 — POST /v1/mobile/auth/withdraw/ */
export async function withdrawAccount(
  refreshToken?: string
): Promise<{ success: boolean; message: string; deactivated_at: string }> {
  return apiClient(`${BASE}/withdraw/`, {
    method: 'POST',
    body: refreshToken ? { refresh_token: refreshToken } : {},
    auth: true,
  });
}

/** 로그아웃 — POST /v1/mobile/auth/logout/ (Bearer) {refresh_token} */
export async function logoutApi(refreshToken: string): Promise<void> {
  await apiClient<{ message?: string }>(`${BASE}/logout/`, {
    method: 'POST',
    body: { refresh_token: refreshToken },
    auth: true,
  });
}

export type RegisterRequest = {
  email: string;
  password: string;
  nickname: string;
};

/** 회원가입 — POST /v1/mobile/auth/register/ (백엔드 경로에 맞게 수정) */
export async function registerUser(data: RegisterRequest): Promise<void> {
  await apiClient(`${BASE}/register/`, {
    method: 'POST',
    body: data,
    auth: false,
  });
}

export { ApiError };
