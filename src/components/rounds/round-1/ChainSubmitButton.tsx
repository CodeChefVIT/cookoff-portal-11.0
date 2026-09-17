'use client';

import { useIsMutating, useMutationState } from '@tanstack/react-query';
import { toast } from 'sonner';

import { attemptKeys, isApiError, visualSubmissionKeys } from '@/api';
import { Button } from '@/components/ui/button';
import { useMounted } from '@/hooks/use-mounted';
import { EMPTY_CHAIN, useChainStore } from '@/stores';

import { useRoundExpired, useVisualSubmission } from '../hooks';

export interface ChainSubmitButtonProps {
  questionId: string;
}

/**
 * ROUND 1 - header Submit button (`RoundConfig.headerSubmit`). It sits in
 * `RoundHeader`, a separate part of the tree from `ScratchEngine`, so it
 * reads the chain straight from `chain-store` rather than via props; the two
 * components share the submission result through `useVisualSubmissionState`
 * (read in `ScratchEngine`), never through this component directly.
 */
export function ChainSubmitButton({ questionId }: ChainSubmitButtonProps) {
  const chain = useChainStore(state => state.chains[questionId] ?? EMPTY_CHAIN);
  const submission = useVisualSubmission(questionId);
  const isExpired = useRoundExpired();

  function handleSubmit() {
    if (chain.length === 0) {
      toast.error('Add at least one block to your chain before submitting.');
      return;
    }
    // The chain is never cleared here, on success or on error — only the
    // explicit "Clear chain" action in WorkspaceCanvas does that.
    submission.mutate(chain, {
      onError: error => {
        toast.error(isApiError(error) ? error.message : 'Could not submit — try again.');
      },
    });
  }

  // `BuyInGate` auto-creates the R1 attempt on open; submitting before it lands
  // 403s with "Question not bought yet" (L14) — nonsense copy for a round with
  // no buy-in. Gate on the unlock having *succeeded*, not merely on it being
  // in flight: the unlock is fired from an effect, so on the first paint there
  // is no mutation to observe yet and a restored chain could be submitted
  // straight into that 403.
  const unlockStatuses = useMutationState({
    filters: { mutationKey: attemptKeys.detail(questionId) },
    select: mutation => mutation.state.status,
  });
  const unlocked = unlockStatuses.at(-1) === 'success';

  // `submission.isPending` only covers *this* mount's mutation instance, so a
  // question-tab switch and back re-enabled Submit while the first request was
  // still in flight — two submissions, two contradictory verdicts. The
  // mutation cache is shared across mounts, so ask it instead.
  const submitting = useIsMutating({ mutationKey: visualSubmissionKeys.detail(questionId) }) > 0;

  // `chain-store` rehydrates from localStorage after the server render, so the
  // button's disabled state would otherwise differ between the two passes.
  const mounted = useMounted();

  const disabled =
    !mounted || isExpired || chain.length === 0 || submission.isPending || submitting || !unlocked;

  return (
    <Button
      onClick={handleSubmit}
      disabled={disabled}
      className="h-[52px] rounded-[5px] bg-scratch-submit px-5 font-scratch-text text-[26px] leading-normal font-normal tracking-[0.72px] text-scratch-submit-ink hover:bg-scratch-submit/85 lg:h-[56px] lg:min-w-[144px] lg:px-[24px] lg:text-[29px]"
    >
      {submission.isPending ? 'Submitting…' : 'Submit'}
    </Button>
  );
}
