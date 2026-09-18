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
  const { question, isLoading, isError, refetch } = useQuestion(1, questionId);

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

  // `GET /question/:id` is not round-scoped, and R1 auto-creates the attempt on
  // open — so another round's question reached through a hand-typed URL would
  // be unlocked (and charged, if it carries a buy-in) without any prompt.
  if (question.round !== 1) {
    return (
      <div className="flex min-h-[50dvh] flex-col items-center justify-center gap-3">
        <p className="text-sm text-muted-foreground">
          This problem belongs to Round {question.round}, not Round 1.
        </p>
      </div>
    );
  }

  return (
    // `question.id` rather than the route param: a hand-typed or shared URL can
    // spell the UUID in a different case, and the header's Submit button keys
    // its chain and mutation off whatever is passed here. Mismatched keys left
    // Submit greyed out beside a full chain.
    <BuyInGate questionId={question.id} roundId={1} question={question}>
      <ScratchEngine question={question} />
    </BuyInGate>
  );
}
