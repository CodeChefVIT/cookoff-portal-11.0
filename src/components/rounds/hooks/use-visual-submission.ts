'use client';

import { useMutation, useMutationState, useQueryClient } from '@tanstack/react-query';

import { questionKeys, sessionKeys, submitVisual, visualSubmissionKeys } from '@/api';

import type { VisualSubmissionResult } from '../types';

/**
 * `POST /submit/visual` — SPEC-ONLY (see AGENTS.md). Synchronous, no
 * polling. Called from `ChainSubmitButton` — Round 1's header Submit button
 * (`RoundConfig.headerSubmit`) — not from `ScratchEngine`, which lives in a
 * separate part of the tree (below `RoundShell`'s header). `ScratchEngine`
 * only *reads* the result via `useVisualSubmissionState` below: two separate
 * `useMutation()` instances never share reactive state just because their
 * `mutationKey` matches — only `useMutationState` observes the shared
 * mutation cache across components.
 */
export function useVisualSubmission(questionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: visualSubmissionKeys.detail(questionId),
    mutationFn: (blocks: string[]) => submitVisual({ questionId, blocks }),
    onSuccess: result => {
      if (result.correct && !result.alreadyAnswered) {
        void queryClient.invalidateQueries({ queryKey: sessionKeys.all() });
        void queryClient.invalidateQueries({ queryKey: questionKeys.list({ round: 1 }) });
      }
    },
  });
}

export interface VisualSubmissionState {
  result?: VisualSubmissionResult;
  isPending: boolean;
}

/**
 * Read-only view of `questionId`'s latest visual submission, shared between
 * `ChainSubmitButton` (which calls `useVisualSubmission` above) and
 * `ScratchEngine` (which renders the verdict/result modal).
 */
export function useVisualSubmissionState(questionId: string): VisualSubmissionState {
  const states = useMutationState({
    filters: { mutationKey: visualSubmissionKeys.detail(questionId) },
    select: mutation => ({
      result: mutation.state.data as VisualSubmissionResult | undefined,
      isPending: mutation.state.status === 'pending',
    }),
  });
  return states.at(-1) ?? { result: undefined, isPending: false };
}
