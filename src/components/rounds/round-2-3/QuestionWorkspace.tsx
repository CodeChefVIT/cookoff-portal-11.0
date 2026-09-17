'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils';

import { BuyInGate } from '../BuyInGate';
import { useQuestion, useRoundQuestions } from '../hooks';
import { QuestionTabs } from '../QuestionTabs';
import type { Question } from '../types';
import { CodeEngine } from './CodeEngine';
import { workspaceGridTemplate } from './column-resize';
import { useWorkspaceColumns } from './use-column-resize';
import { TABS_BAND, WORKSPACE_GRID } from './WorkspaceLayout';

export interface QuestionWorkspaceProps {
  roundId: 2 | 3;
  questionId: string;
}

/**
 * Resolves a single question (`GET /question/:id`, confirmed
 * participant-facing) and hands off to `QuestionReady` once it's loaded.
 * Kept as a thin loading/error shell — see `QuestionReady` for why the rest
 * of the hooks live in a separate component: mounting them only once
 * `question` exists keeps this component's own hook count identical across
 * every one of its renders (loading -> loaded is a mount of a *different*
 * component, not a mid-lifecycle branch of this one). It also owns the
 * question tabs so they stay put across loading/locked/unlocked; from `lg`
 * they're overlaid into the workspace's `TABS_BAND`, as in Figma
 * `Desktop - 15/14`.
 */
export function QuestionWorkspace({ roundId, questionId }: QuestionWorkspaceProps) {
  const { question, isLoading, isError, refetch } = useQuestion(roundId, questionId);
  const { data: questions } = useRoundQuestions(roundId);
  const columns = useWorkspaceColumns();

  return (
    <div className="relative">
      {questions && questions.length > 0 && (
        <div
          style={{ gridTemplateColumns: workspaceGridTemplate(columns) }}
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
      ) : question.round !== roundId ? (
        // `GET /question/:id` is not round-scoped, so a hand-typed or shared
        // URL can address another round's question. Rendering it under this
        // round's config would apply the wrong buy-in rules — on R3
        // (`hasBuyIn: false`, `autoAttempt: true`) that silently debits an R2
        // question's buy-in with no confirmation box.
        <div
          className={cn('flex min-h-[50dvh] flex-col items-center justify-center gap-3', TABS_BAND)}
        >
          <p className="text-sm text-muted-foreground">
            This problem belongs to Round {question.round}, not Round {roundId}.
          </p>
        </div>
      ) : (
        <QuestionReady roundId={roundId} questionId={questionId} question={question} />
      )}
    </div>
  );
}

interface QuestionReadyProps {
  roundId: 2 | 3;
  questionId: string;
  question: Question;
}

/**
 * Composes `BuyInGate` + `CodeEngine` for an already-loaded question. A
 * `402/403` from `/submit` (stale unlock cache) forces the gate closed again,
 * per AGENTS.md rule 6: the server always wins.
 */
function QuestionReady({ roundId, questionId, question }: QuestionReadyProps) {
  const [forceLocked, setForceLocked] = useState(false);

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
        onNotPurchased={() => setForceLocked(true)}
        // Clears the forced re-lock once the server accepts a fresh unlock.
        // Without this the flag was one-way: after a single stale-unlock 403,
        // the `question.bought` path stayed ANDed with `!forceLocked` forever.
        onPurchased={() => setForceLocked(false)}
      />
    </BuyInGate>
  );
}
