'use client';

import { toast } from 'sonner';

import { isApiError } from '@/api';
import { Button } from '@/components/ui/button';
import { EMPTY_CHAIN, useChainStore } from '@/stores';

import { useRoundTimer, useVisualSubmission } from '../hooks';

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
  const { isExpired } = useRoundTimer();

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

  const disabled = isExpired || chain.length === 0 || submission.isPending;

  return (
    <Button size="sm" onClick={handleSubmit} disabled={disabled}>
      {submission.isPending ? 'Submitting…' : 'Submit'}
    </Button>
  );
}
