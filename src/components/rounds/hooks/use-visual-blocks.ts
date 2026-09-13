'use client';

import { useQuery } from '@tanstack/react-query';

import { blockKeys, getVisualBlocks } from '@/api';

/**
 * `GET /question/:id/blocks` — Round 1 only. A question's block set never
 * changes mid-contest, so it's fetched once and never refetched.
 */
export function useVisualBlocks(questionId: string) {
  return useQuery({
    queryKey: blockKeys.detail(questionId),
    queryFn: () => getVisualBlocks(questionId),
    staleTime: Infinity,
  });
}
