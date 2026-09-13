'use client';

import { useQuery } from '@tanstack/react-query';

import { getQuestionsByRound, questionKeys } from '@/api';

import { sortQuestionsForRound } from '../round-config';

export function useRoundQuestions(roundId: number) {
  return useQuery({
    queryKey: questionKeys.list({ round: roundId }),
    queryFn: async () => sortQuestionsForRound(await getQuestionsByRound(roundId)),
    staleTime: 30_000,
  });
}
