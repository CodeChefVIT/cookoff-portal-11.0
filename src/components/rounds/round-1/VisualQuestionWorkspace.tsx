'use client';

import { BuyInGate } from '../BuyInGate';
import { useQuestion } from '../hooks';
import { ScratchEngine } from './ScratchEngine';

export interface VisualQuestionWorkspaceProps {
  questionId: string;
}

/**
 * Resolves a single Round 1 question from the round list (`GET
 * /question/:id` is admin-only, same L-note as R2/R3 — see AGENTS.md) and
 * composes `BuyInGate` (a pass-through: R1 has no buy-in) + `ScratchEngine`.
 */
export function VisualQuestionWorkspace({ questionId }: VisualQuestionWorkspaceProps) {
  const { question, index, isLoading, isError, refetch } = useQuestion(1, questionId);

  if (isLoading) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center" role="status">
        <span className="text-sm text-muted-foreground">Loading problem…</span>
      </div>
    );
  }

  if (isError || !question) {
    return (
      <div className="flex min-h-[50dvh] flex-col items-center justify-center gap-3">
        <p className="text-sm text-muted-foreground">Couldn&rsquo;t load this problem.</p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <BuyInGate questionId={questionId} roundId={1} question={question}>
      <ScratchEngine question={question} index={index} />
    </BuyInGate>
  );
}
