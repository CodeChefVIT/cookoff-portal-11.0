'use client';

import { useQuery } from '@tanstack/react-query';

import { getQuestionById, questionKeys } from '@/api';

import { useRoundQuestions } from './use-round-questions';

/**
 * `GET /question/:id` is participant-facing (JWT + ban check only, not
 * admin-gated — confirmed against `internal/router/router.go`), so a single
 * question is fetched directly rather than derived from the round list.
 * `solved`/`bought` still come from the round list merge (`useRoundQuestions`)
 * since `GET /question/:id` carries no per-user attempt flag either.
 */
export function useQuestion(roundId: number, questionId: string) {
  const detail = useQuery({
    queryKey: questionKeys.detail(questionId),
    queryFn: () => getQuestionById(questionId),
    staleTime: 30_000,
  });
  const list = useRoundQuestions(roundId);

  const position = list.data?.findIndex(candidate => candidate.id === questionId) ?? -1;
  const flagsFromList = position >= 0 ? list.data?.[position] : undefined;
  const question = detail.data
    ? { ...detail.data, solved: flagsFromList?.solved, bought: flagsFromList?.bought }
    : flagsFromList;
  // 1-based, in the same order as the question tabs, for the "Problem N:" prefix.
  const index = position >= 0 ? position + 1 : undefined;

  return {
    question,
    index,
    isLoading: detail.isLoading && list.isLoading,
    isError: detail.isError && !flagsFromList,
    refetch: detail.refetch,
  };
}
