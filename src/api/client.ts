import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { API_TIMEOUT_MS } from '@/constants';
import { env } from '@/env';

import { toApiError } from './errors';

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/**
 * `cookoff-11.0-be`'s middleware (`internal/middlewares/jwt.go`) reads a
 * Bearer header, but it is attached to no route today, and the LLD (§2.5.4)
 * plus the admin client both use httpOnly cookies + `POST /refreshToken`.
 * We follow the cookie contract; if the backend ships Bearer auth instead,
 * this file is the only place that needs to change.
 */
export function createApiClient(baseURL: string) {
  const client = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
    timeout: API_TIMEOUT_MS,
    withCredentials: true,
  });

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
          await client.post('/refreshToken', {});
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
