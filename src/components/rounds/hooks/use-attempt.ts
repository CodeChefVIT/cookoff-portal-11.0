'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { attemptKeys, createAttempt, questionKeys, sessionKeys } from '@/api';

/**
 * `POST /question/:id/attempt` has no read counterpart (L3): a `200` and a
 * `409` ("already bought") are both treated as a successful unlock. No
 * optimistic update — the editor only unlocks after the server confirms.
 */
export function useAttempt(roundId: number, questionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: attemptKeys.detail(questionId),
    mutationFn: () => createAttempt(questionId),
    onSuccess: outcome => {
      if (!outcome.unlocked) return;
      toast.success('Bet placed — the editor is unlocked.');
      void queryClient.invalidateQueries({ queryKey: sessionKeys.all() });
      void queryClient.invalidateQueries({ queryKey: questionKeys.list({ round: roundId }) });
    },
  });
}
