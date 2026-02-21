/**
 * API 클라이언트 — JWT Bearer 토큰 기반
 * 401 발생 시 자동으로 토큰 갱신 후 재시도
 */

import { API_BASE_URL } from '@/constants/api';

export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiRequestConfig {
  method?: ApiMethod;
  body?: unknown;
  headers?: Record<string, string>;
  /** 인증 필요 시 true (기본 true) */
  auth?: boolean;
}

let accessToken: string | null = null;

// 토큰 갱신 콜백 (auth-context에서 등록)
let onTokenRefresh: (() => Promise<string | null>) | null = null;
let onAuthFailed: (() => void) | null = null;

export function setAuthToken(token: string | null) {
  accessToken = token;
}

export function getAuthToken(): string | null {
  return accessToken;
}

/** auth-context에서 토큰 갱신/실패 콜백 등록 */
export function setAuthCallbacks(
  refreshCb: () => Promise<string | null>,
  failedCb: () => void,
) {
  onTokenRefresh = refreshCb;
  onAuthFailed = failedCb;
}

// 동시 갱신 방지
let refreshPromise: Promise<string | null> | null = null;

async function tryRefreshToken(): Promise<string | null> {
  if (!onTokenRefresh) return null;
  if (refreshPromise) return refreshPromise;
  refreshPromise = onTokenRefresh().finally(() => { refreshPromise = null; });
  return refreshPromise;
}

function buildUrl(path: string): string {
  return path.startsWith('http') ? path : `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

function buildHeaders(headers: Record<string, string>, auth: boolean): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json', ...headers };
  if (auth && accessToken) h['Authorization'] = `Bearer ${accessToken}`;
  return h;
}

async function parseResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type');
  if (contentType?.includes('application/json')) return res.json() as Promise<T>;
  return res.text() as Promise<T>;
}

async function parseError(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    return json.error ?? json.detail ?? json.message ?? text;
  } catch {
    return text;
  }
}

export async function apiClient<T = unknown>(
  path: string,
  config: ApiRequestConfig = {}
): Promise<T> {
  const { method = 'GET', body, headers = {}, auth = true } = config;
  const url = buildUrl(path);
  const fetchOpts = {
    method,
    headers: buildHeaders(headers, auth),
    ...(body != null && { body: JSON.stringify(body) }),
  };

  const res = await fetch(url, fetchOpts);

  // 401 + 인증 요청이면 토큰 갱신 후 재시도
  if (res.status === 401 && auth) {
    const newToken = await tryRefreshToken();
    if (newToken) {
      const retryHeaders = { ...fetchOpts.headers, Authorization: `Bearer ${newToken}` };
      const retryRes = await fetch(url, { ...fetchOpts, headers: retryHeaders });
      if (retryRes.ok) return parseResponse<T>(retryRes);
      // 재시도도 실패하면 강제 로그아웃
      if (retryRes.status === 401) onAuthFailed?.();
      throw new ApiError(retryRes.status, await parseError(retryRes), retryRes);
    }
    // 갱신 실패 → 강제 로그아웃
    onAuthFailed?.();
    throw new ApiError(res.status, await parseError(res), res);
  }

  if (!res.ok) {
    throw new ApiError(res.status, await parseError(res), res);
  }

  return parseResponse<T>(res);
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public response: Response
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
