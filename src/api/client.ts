import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { API_TIMEOUT_MS } from '@/constants';
import { env } from '@/env';

import { toApiError } from './errors';

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/**
 * Session auth is the backend's httpOnly `access_token`/`refresh_token`
 * cookies (`internal/helpers/auth`), so every request goes out
 * `withCredentials`, and a 401 triggers one shared `POST /refreshToken`
 * before the request is replayed.
 */
export function createApiClient(baseURL: string) {
  const client = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
    timeout: API_TIMEOUT_MS,
    withCredentials: true,
  });

  /**
   * One shared refresh per client. The access token expires on a fixed TTL, so
   * every query in flight 401s within the same instant — without this, a single
   * page fired one `POST /refreshToken` per request, and the whole field does
   * it simultaneously because everyone signs in at the same time.
   */
  let refreshInFlight: Promise<unknown> | null = null;
  const refreshSession = () => {
    refreshInFlight ??= client.post('/refreshToken', {}).finally(() => {
      refreshInFlight = null;
    });
    return refreshInFlight;
  };

  client.interceptors.response.use(
    response => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetryableRequestConfig | undefined;

      const isRefreshCall = originalRequest?.url?.includes('/refreshToken');
      if (
        originalRequest &&
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !isRefreshCall
      ) {
        originalRequest._retry = true;
        try {
          await refreshSession();
          return client(originalRequest);
        } catch {
          return Promise.reject(toApiError(error));
        }
      }

      return Promise.reject(toApiError(error));
    }
  );

  return client;
}

export const api = createApiClient(env.NEXT_PUBLIC_API_URL);
