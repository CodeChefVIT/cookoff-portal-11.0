'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { attemptKeys } from '@/api';
import { Button } from '@/components/ui/button';

import { BuyInConfirm } from './BuyInConfirm';
import { BuyInLockContext } from './BuyInLock';
import { useAttempt, useSession } from './hooks';
import { getRoundConfig } from './round-config';
import type { Question, RoundId } from './types';

/**
 * SHARED BUY-IN GATE
 *
 * R2: gates the workspace behind `POST /attempts/:id`. The lock state and the
 * `BuyInConfirm` box (352:744) go down through `BuyInLockContext`; only the
 * `BuyInLockSurface` inside (the editor + results column) blurs and goes
 * inert, so the problem statement stays readable before buying. Only a
 * response with `unlocked: true` opens it — an
 * insufficient-balance response is still a successful call. R1/R3
 * (`RoundConfig.hasBuyIn === false`) are pass-throughs — never a bet prompt,
 * even on a spurious `402` from `/submit` (see AGENTS.md C2/L7). R1
 * (`autoAttempt`) still creates the attempt silently on open, because
 * `/submit/visual` rejects a question with no `bought` attempt (L14).
 */
export interface BuyInGateProps {
  children: ReactNode;
  questionId: string;
  roundId: RoundId;
  question: Question;
  /** Re-locks the editor when `/submit` reports the attempt was never purchased (stale client cache). */
  forceLocked?: boolean;
}

const BET_FAILED = 'Couldn’t place your bet. Try again.';

export function BuyInGate({
  children,
  questionId,
  roundId,
  question,
  forceLocked,
}: BuyInGateProps) {
  const config = getRoundConfig(roundId);
  const session = useSession();
  const attempt = useAttempt(roundId, questionId);

  const { mutate: unlock, isIdle, reset } = attempt;
  const autoUnlock = config.autoAttempt && question.bought !== true;
  // Dev Strict Mode re-runs this effect before `isIdle` flips, and a remount can
  // land while the first POST is in flight; a second POST races the first and
  // its 500 shows the retry banner. Send at most one per question.
  const queryClient = useQueryClient();
  const autoUnlockSentFor = useRef<string | null>(null);
  useEffect(() => {
    if (!autoUnlock || !isIdle || autoUnlockSentFor.current === questionId) return;
    if (queryClient.isMutating({ mutationKey: attemptKeys.detail(questionId) }) > 0) return;
    autoUnlockSentFor.current = questionId;
    unlock();
  }, [autoUnlock, isIdle, unlock, questionId, queryClient]);

  // A stale unlock (earlier bet in this mount) must not keep the editor open once the server re-locks.
  useEffect(() => {
    if (!config.hasBuyIn || !forceLocked) return;
    reset();
    toast.error('The server didn’t recognize your bet — place it again before submitting.');
  }, [config.hasBuyIn, forceLocked, reset]);

  if (!config.hasBuyIn) {
    const unlockFailed =
      config.autoAttempt && (attempt.isError || attempt.data?.unlocked === false);
    return (
      <>
        {unlockFailed && (
          <div
            role="alert"
            className="mx-4 mb-3 flex items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive lg:mx-[31px]"
          >
            <span>Couldn&rsquo;t unlock this question — submitting will fail until it is.</span>
            <Button size="sm" variant="outline" onClick={() => unlock()}>
              Retry unlock
            </Button>
          </div>
        )}
        {children}
      </>
    );
  }

  const unlocked = attempt.data?.unlocked === true || (question.bought === true && !forceLocked);
  const buyIn = Number(question.buyIn);
  const balance = session.data?.balance ?? 0;

  function handleEnter() {
    if (balance < buyIn) {
      toast.error(`Not enough coins — you need ${buyIn - balance} more.`);
      return;
    }
    attempt.mutate(undefined, {
      onSuccess: outcome => {
        if (outcome.unlocked) return;
        toast.error(
          outcome.insufficientBalance
            ? `Not enough coins — you need ${buyIn - balance} more.`
            : BET_FAILED
        );
      },
      onError: () => toast.error(BET_FAILED),
    });
  }

  return (
    <BuyInLockContext
      value={{
        locked: !unlocked,
        prompt: (
          <BuyInConfirm onEnter={handleEnter} backHref="/dashboard" isPending={attempt.isPending} />
        ),
      }}
    >
      {children}
    </BuyInLockContext>
  );
}
