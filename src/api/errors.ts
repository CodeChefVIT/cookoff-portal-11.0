import { isAxiosError } from 'axios';
import { ZodError } from 'zod';

import type { ApiErrorData } from '@/types';

export class ApiError extends Error {
  readonly status?: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor({ message, status, code, details }: ApiErrorData) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * `/submit` answers 403 both for "Question not purchased" and for "User not
 * qualified for this round" (`submission.go:71,93`); only the first one means
 * the buy-in gate should re-lock. The status alone can't tell them apart, so
 * match the server's message.
 */
export function isNotPurchasedError(error: unknown): boolean {
  if (!isApiError(error)) return false;
  if (error.status !== 402 && error.status !== 403) return false;
  return !/not qualified/i.test(error.message);
}

/** A 403 that means the round itself is closed to this account. */
export function isNotQualifiedError(error: unknown): boolean {
  return isApiError(error) && error.status === 403 && /not qualified/i.test(error.message);
}

/**
 * `423 Locked` — the contest timer is stopped, or it is running a round other
 * than the one this question belongs to. Returned by `POST /submit`,
 * `POST /attempts/:id` and `POST /submit/visual` via `ensureRoundRunning`
 * (`internal/controllers/timer.go`). Deliberately distinct from the
 * 402/403/409 buy-in statuses: nothing about the question or the balance
 * changed, so the gate must not re-lock or blame the player's coins.
 */
export function isRoundNotRunningError(error: unknown): boolean {
  return isApiError(error) && error.status === 423;
}

export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) return error;

  if (isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as Record<string, unknown> | undefined;
    // Backend error bodies are inconsistent across handlers: app routes use
    // {success,message,errors}, middleware (echo.NewHTTPError) emits
    // {message}, and some clients expect {error}. Tolerate all three so a
    // 401 from middleware doesn't render as "An unexpected error occurred".
    const message =
      (data?.message as string | undefined) ?? (data?.error as string | undefined) ?? error.message;
    return new ApiError({
      message,
      status,
      code: data?.code as string | undefined,
      details: data,
    });
  }

  if (error instanceof ZodError) {
    return new ApiError({
      message: 'Validation error',
      code: 'VALIDATION_ERROR',
      details: error.issues,
    });
  }

  if (error instanceof Error) {
    return new ApiError({ message: error.message });
  }

  return new ApiError({ message: 'An unexpected error occurred' });
}
