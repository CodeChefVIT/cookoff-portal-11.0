import { env } from '@/env';
import { createQueryKeys } from '@/lib/query';

import { isApiError } from './errors';
import { readFixture } from './fixtures';
import { request } from './request';

export const attemptKeys = createQueryKeys('attempts');

export interface AttemptOutcome {
  /** `true` for a fresh unlock (200) or an already-unlocked question (409, L3). */
  unlocked: boolean;
  /** Set when the server rejected the buy-in for an affordability reason. */
  insufficientBalance: boolean;
}

/**
 * `POST /attempts/:id` (`internal/router/attempt_routes.go` ->
 * `AttemptController.CreateAttempt`). No request body; the question's fixed
 * `buy_in` is debited server-side in one transaction. A `409` means an
 * `attempts` row already exists for this `(user, question)` — per L3 that
 * is treated as a successful unlock, never as an error. `402` is
 * "insufficient balance".
 */
export async function createAttempt(questionId: string): Promise<AttemptOutcome> {
  if (env.NEXT_PUBLIC_USE_MOCK_API) return readFixture('attempt', questionId);

  try {
    await request({ url: `/attempts/${questionId}`, method: 'POST', data: {} });
    return { unlocked: true, insufficientBalance: false };
  } catch (error) {
    if (isApiError(error) && error.status === 409) {
      return { unlocked: true, insufficientBalance: false };
    }
    if (isApiError(error) && (error.status === 402 || error.status === 403)) {
      return { unlocked: false, insufficientBalance: true };
    }
    throw error;
  }
}
