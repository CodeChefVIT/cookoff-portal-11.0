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
 * `POST /attempts/:id` (`attempt_routes.go`). No request body; the fixed
 * `question.buyIn` is debited server-side and a pre-seeded `available` row is
 * upgraded to `bought`. A `409` means the question is already bought or
 * answered — per L3 that is a successful unlock, never an error.
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
