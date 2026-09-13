'use client';

import { useState } from 'react';

import { BuyInGate } from '../BuyInGate';
import { useQuestion } from '../hooks';
import { CodeEngine } from './CodeEngine';

export interface QuestionWorkspaceProps {
  roundId: 2 | 3;
  questionId: string;
}

/**
 * Resolves a single question from the round list (`GET /question/:id` is
 * admin-only — L-noted in AGENTS.md) and composes `BuyInGate` + `CodeEngine`.
 * A `402/403` from `/submit` (stale unlock cache) forces the gate closed
 * again, per AGENTS.md rule 6: the server always wins.
 */
export function QuestionWorkspace({ roundId, questionId }: QuestionWorkspaceProps) {
  const { question, index, isLoading, isError, refetch } = useQuestion(roundId, questionId);
  const [forceLocked, setForceLocked] = useState(false);

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
    <BuyInGate
      questionId={questionId}
      roundId={roundId}
      question={question}
      forceLocked={forceLocked}
    >
      <CodeEngine
        question={question}
        roundId={roundId}
        index={index}
        onNotPurchased={() => setForceLocked(true)}
      />
    </BuyInGate>
  );
}
