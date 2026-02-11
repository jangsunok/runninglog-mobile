/**
 * API 클라이언트 — JWT Bearer 토큰 기반
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

export function setAuthToken(token: string | null) {
  accessToken = token;
}

export async function apiClient<T = unknown>(
  path: string,
  config: ApiRequestConfig = {}
): Promise<T> {
  const { method = 'GET', body, headers = {}, auth = true } = config;
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };
  if (auth && accessToken) {
    requestHeaders['Authorization'] = `Bearer ${accessToken}`;
  }

  const res = await fetch(url, {
    method,
    headers: requestHeaders,
    ...(body != null && { body: JSON.stringify(body) }),
  });

  if (!res.ok) {
    const text = await res.text();
    let message = text;
    try {
      const json = JSON.parse(text);
      message = json.error ?? json.detail ?? json.message ?? text;
    } catch {
      /* keep text */
    }
    throw new ApiError(res.status, message, res);
  }

  const contentType = res.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return res.json() as Promise<T>;
  }
  return res.text() as Promise<T>;
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
