'use client';

import { useRoundQuestions } from './use-round-questions';

/**
 * `GET /question/:id` is JWT+Admin only (LLD §2.2) and unusable from the
 * portal — a single question is derived from the already-fetched round list
 * (`GET /question/round`) instead of a dedicated per-question fetch.
 */
export function useQuestion(roundId: number, questionId: string) {
  const list = useRoundQuestions(roundId);
  const question = list.data?.find(candidate => candidate.id === questionId);
  return { question, isLoading: list.isLoading, isError: list.isError, refetch: list.refetch };
}
