'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { attemptKeys, createAttempt, questionKeys, sessionKeys } from '@/api';

import { getRoundConfig } from '../round-config';
import type { RoundId } from '../types';

/**
 * `POST /attempts/:id` has no read counterpart (L3): a `200` and a `409`
 * ("already bought") are both treated as a successful unlock. No optimistic
 * update — the editor only unlocks after the server confirms. The "bet
 * placed" toast only makes sense for rounds with a real buy-in.
 */
export function useAttempt(roundId: RoundId, questionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: attemptKeys.detail(questionId),
    mutationFn: () => createAttempt(questionId),
    onSuccess: outcome => {
      if (!outcome.unlocked) {
        // A rejected buy-in still means our cached balance disagreed with the
        // server's — refresh it, or the gate keeps offering a bet the player
        // cannot afford and quotes a shortfall from the stale number.
        if (outcome.insufficientBalance) {
          void queryClient.invalidateQueries({ queryKey: sessionKeys.all() });
        }
        return;
      }
      if (getRoundConfig(roundId).hasBuyIn) toast.success('Bet placed — the editor is unlocked.');
      void queryClient.invalidateQueries({ queryKey: sessionKeys.all() });
      void queryClient.invalidateQueries({ queryKey: questionKeys.list({ round: roundId }) });
    },
  });
}
