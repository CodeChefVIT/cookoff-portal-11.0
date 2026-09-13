'use client';

import { useQuery } from '@tanstack/react-query';

import { getQuestionsByRound, mergeAttemptStatus, questionKeys } from '@/api';

import { sortQuestionsForRound } from '../round-config';
import { useSession } from './use-session';

/**
 * `GET /question/round` never carries a solved/bought flag; those come from
 * `GET /dashboard`'s embedded `questions[].attempt_status` (current round
 * only). Merging the two here is the only place that combination happens.
 */
export function useRoundQuestions(roundId: number) {
  const session = useSession();
  const query = useQuery({
    queryKey: questionKeys.list({ round: roundId }),
    queryFn: async () => sortQuestionsForRound(await getQuestionsByRound(roundId)),
    staleTime: 30_000,
  });

  const data = query.data ? mergeAttemptStatus(query.data, session.data?.questions) : query.data;

  return {
    data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
