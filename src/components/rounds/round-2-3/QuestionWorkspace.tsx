'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { isBountyResolvedNow, useRoundStore } from '@/stores';

import { BuyInGate } from '../BuyInGate';
import { useQuestion } from '../hooks';
import type { Question } from '../types';
import { BountyUnlockDialog } from './BountyUnlockDialog';
import { CodeEngine } from './CodeEngine';
import { DEFAULT_LANGUAGE } from './languages';

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
 * component, not a mid-lifecycle branch of this one).
 */
export function QuestionWorkspace({ roundId, questionId }: QuestionWorkspaceProps) {
  const { question, isLoading, isError, refetch } = useQuestion(roundId, questionId);

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

  return <QuestionReady roundId={roundId} questionId={questionId} question={question} />;
}

interface QuestionReadyProps {
  roundId: 2 | 3;
  questionId: string;
  question: Question;
}

/**
 * Composes `BuyInGate` + `CodeEngine` and the bounty-unlock dialog for an
 * already-loaded question. A `402/403` from `/submit` (stale unlock cache)
 * forces the gate closed again, per AGENTS.md rule 6: the server always
 * wins.
 *
 * The bounty dialog's open/closed state is plain local `useState`, seeded
 * once from a non-reactive store snapshot (`isBountyResolvedNow`) and
 * closed explicitly by the dialog's own handlers — it does not stay
 * subscribed to the store for its visibility. `resolveBounty` still writes
 * through to the store so a future mount of this question remembers the
 * dialog was already seen.
 */
function QuestionReady({ roundId, questionId, question }: QuestionReadyProps) {
  const router = useRouter();
  const [forceLocked, setForceLocked] = useState(false);

  const resolveBounty = useRoundStore.use.resolveBounty();
  const resetDraft = useRoundStore.use.resetDraft();

  const [bountyDialogOpen, setBountyDialogOpen] = useState(
    () => question.bountyActive === true && !isBountyResolvedNow(question.id)
  );

  return (
    <>
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
        />
      </BuyInGate>
      <BountyUnlockDialog
        open={bountyDialogOpen}
        onOpenChange={open => {
          setBountyDialogOpen(open);
          if (!open) resolveBounty(question.id);
        }}
        onEnter={() => {
          resetDraft(question.id, DEFAULT_LANGUAGE.id, DEFAULT_LANGUAGE.boilerplate);
          resolveBounty(question.id);
          setBountyDialogOpen(false);
        }}
        onStayHere={() => {
          resolveBounty(question.id);
          setBountyDialogOpen(false);
          router.push(`/round/${roundId}`);
        }}
      />
    </>
  );
}
