// Cross-cutting TS types. Feature-local types stay colocated with their feature.

export interface ApiErrorData {
  message: string;
  code?: string;
  details?: unknown;
  status?: number;
  /** Seconds from a `Retry-After` header (429 / 503). */
  retryAfter?: number;
}

export type { Question, RoundId, Testcase, VisualBlock, VisualSubmissionResult } from './rounds';
