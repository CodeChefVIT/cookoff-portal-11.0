import type { AttemptStatus } from '@/api';

import type { Question } from './types';

/**
 * Overlays the per-user attempt status from `/dashboard` (L4) onto a round's
 * questions as `solved`/`bought`. Questions the dashboard doesn't list keep
 * whatever flags they already had.
 */
export function withAttemptStatuses(
  questions: Question[],
  statuses: Readonly<Record<string, AttemptStatus>> | undefined
): Question[] {
  if (!statuses) return questions;
  return questions.map(question => {
    const status = statuses[question.id];
    if (!status) return question;
    return { ...question, solved: status === 'answered', bought: status !== 'available' };
  });
}
