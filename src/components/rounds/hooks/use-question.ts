'use client';

import { useRoundQuestions } from './use-round-questions';

/**
 * `GET /question/:id` is JWT+Admin only (LLD §2.2) and unusable from the
 * portal — a single question is derived from the already-fetched round list
 * (`GET /question/round`) instead of a dedicated per-question fetch.
 */
export function useQuestion(roundId: number, questionId: string) {
  const list = useRoundQuestions(roundId);
  const position = list.data?.findIndex(candidate => candidate.id === questionId) ?? -1;
  const question = position >= 0 ? list.data?.[position] : undefined;
  // 1-based, in the same order as the question tabs, for the "Problem N:" prefix.
  const index = position >= 0 ? position + 1 : undefined;
  return {
    question,
    index,
    isLoading: list.isLoading,
    isError: list.isError,
    refetch: list.refetch,
  };
}
