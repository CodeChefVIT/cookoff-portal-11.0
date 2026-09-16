'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils';

import { BuyInGate } from '../BuyInGate';
import { useQuestion, useRoundQuestions } from '../hooks';
import { QuestionTabs } from '../QuestionTabs';
import { CodeEngine } from './CodeEngine';
import { TABS_BAND, WORKSPACE_GRID } from './WorkspaceLayout';

export interface QuestionWorkspaceProps {
  roundId: 2 | 3;
  questionId: string;
}

/**
 * Resolves a single question from the round list (`GET /question/:id` is
 * admin-only — L-noted in AGENTS.md) and composes `BuyInGate` + `CodeEngine`.
 * A `402/403` from `/submit` (stale unlock cache) forces the gate closed
 * again, per AGENTS.md rule 6: the server always wins. Owns the question
 * tabs so they stay put across loading/locked/unlocked; from `lg` they're
 * overlaid into the workspace's `TABS_BAND`, as in Figma `Desktop - 15/14`.
 */
export function QuestionWorkspace({ roundId, questionId }: QuestionWorkspaceProps) {
  const { question, index, isLoading, isError, refetch } = useQuestion(roundId, questionId);
  const { data: questions } = useRoundQuestions(roundId);
  const [forceLocked, setForceLocked] = useState(false);

  return (
    <div className="relative">
      {questions && questions.length > 0 && (
        <div
          className={cn(
            'pointer-events-none px-3 pt-3 lg:absolute lg:inset-x-0 lg:top-0 lg:z-10 lg:pt-[16px]',
            WORKSPACE_GRID
          )}
        >
          <QuestionTabs
            roundId={roundId}
            questions={questions}
            activeId={questionId}
            className="pointer-events-auto min-w-0 lg:pl-[5px]"
          />
        </div>
      )}

      {isLoading ? (
        <div
          role="status"
          className={cn('flex min-h-[50dvh] items-center justify-center', TABS_BAND)}
        >
          <span className="text-sm text-muted-foreground">Loading problem…</span>
        </div>
      ) : isError || !question ? (
        <div
          className={cn('flex min-h-[50dvh] flex-col items-center justify-center gap-3', TABS_BAND)}
        >
          <p className="text-sm text-muted-foreground">Couldn&rsquo;t load this problem.</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground"
          >
            Retry
          </button>
        </div>
      ) : (
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
      )}
    </div>
  );
}
