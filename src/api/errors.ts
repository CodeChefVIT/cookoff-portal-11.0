import { isAxiosError } from 'axios';
import { ZodError } from 'zod';

import type { ApiErrorData } from '@/types';

/**
 * Machine-readable codes from `dto.ErrorResponse.code`
 * (`cookoff-11.0-be/internal/dto/common.go`). Branch on these, never on the
 * human-readable message.
 */
export const ERROR_CODES = {
  validation: 'VALIDATION',
  unauthorized: 'UNAUTHORIZED',
  forbidden: 'FORBIDDEN',
  notFound: 'NOT_FOUND',
  alreadyExists: 'ALREADY_EXISTS',
  rateLimited: 'RATE_LIMITED',
  internal: 'INTERNAL',
  roundNotRunning: 'ROUND_NOT_RUNNING',
  notQualified: 'NOT_QUALIFIED',
  notPurchased: 'NOT_PURCHASED',
  insufficientBalance: 'INSUFFICIENT_BALANCE',
  judgeBusy: 'JUDGE_BUSY',
  judgeFailed: 'JUDGE_FAILED',
  stillJudging: 'STILL_JUDGING',
} as const;

export class ApiError extends Error {
  readonly status?: number;
  readonly code?: string;
  readonly details?: unknown;
  readonly retryAfter?: number;

  constructor({ message, status, code, details, retryAfter }: ApiErrorData) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.retryAfter = retryAfter;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

function hasCode(error: unknown, code: string): boolean {
  return isApiError(error) && error.code === code;
}

/** `/submit` on a Round 2 question that was never bought: the buy-in gate should re-lock. */
export function isNotPurchasedError(error: unknown): boolean {
  return hasCode(error, ERROR_CODES.notPurchased);
}

/** The round is closed to this account (`round_qualified` doesn't match). */
export function isNotQualifiedError(error: unknown): boolean {
  return hasCode(error, ERROR_CODES.notQualified);
}

/**
 * `423 Locked` — the contest timer is stopped, or it is running a round other
 * than the one this question belongs to. Nothing about the question or the
 * balance changed, so the gate must not re-lock or blame the player's coins.
 */
export function isRoundNotRunningError(error: unknown): boolean {
  return hasCode(error, ERROR_CODES.roundNotRunning) || (isApiError(error) && error.status === 423);
}

/** A per-user rate limit (429) or a full judge (503 `JUDGE_BUSY`): wait `retryAfter` and try again. */
export function isTryLaterError(error: unknown): error is ApiError {
  return (
    isApiError(error) &&
    (error.status === 429 ||
      error.code === ERROR_CODES.rateLimited ||
      error.code === ERROR_CODES.judgeBusy)
  );
}

function parseRetryAfter(value: unknown): number | undefined {
  const seconds = Number(value);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : undefined;
}

export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) return error;

  if (isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as Record<string, unknown> | undefined;
    const message = (data?.message as string | undefined) ?? error.message;
    return new ApiError({
      message,
      status,
      code: data?.code as string | undefined,
      details: data,
      retryAfter: parseRetryAfter(error.response?.headers?.['retry-after']),
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
