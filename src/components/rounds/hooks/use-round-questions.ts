'use client';

import { useQuery } from '@tanstack/react-query';

import { getQuestionsByRound, questionKeys } from '@/api';

import { withAttemptStatuses } from '../question-status';
import { sortQuestionsForRound } from '../round-config';
import { useSession } from './use-session';

export function useRoundQuestions(roundId: number) {
  const statuses = useSession().data?.attemptStatuses;

  return useQuery({
    queryKey: questionKeys.list({ round: roundId }),
    queryFn: async () => sortQuestionsForRound(await getQuestionsByRound(roundId)),
    // `/question/round` has no per-user flags (L4); `/dashboard` does.
    select: questions => withAttemptStatuses(questions, statuses),
    staleTime: 30_000,
  });
}
