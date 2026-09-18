'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { isNotQualifiedError } from '@/api';
import type { Question, RoundId } from '@/types';

import { BuyInConfirm } from './BuyInConfirm';
import { BuyInLockContext } from './BuyInLock';
import { useAttempt, useSession } from './hooks';
import { getRoundConfig } from './round-config';

/**
 * SHARED BUY-IN GATE
 *
 * R2: gates the workspace behind `POST /attempts/:id`. The lock state and the
 * `BuyInConfirm` box (352:744) go down through `BuyInLockContext`; only the
 * `BuyInLockSurface` inside (the editor + results column) blurs and goes
 * inert, so the problem statement stays readable before buying. Only a
 * response with `unlocked: true` opens it — an insufficient-balance response
 * is still a successful call. R1/R3 (`RoundConfig.hasBuyIn === false`) are
 * pass-throughs: never a bet prompt and no attempt call.
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
/** 423 — nothing is wrong with the bet or the balance; the round is closed. */
const ROUND_NOT_RUNNING = 'This round is not running right now, so your coins were not touched.';

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
  const { reset } = attempt;

  // A stale unlock (earlier bet in this mount) must not keep the editor open once the server re-locks.
  useEffect(() => {
    if (!config.hasBuyIn || !forceLocked) return;
    reset();
    toast.error('The server did not recognise your bet. Place it again before you submit.');
  }, [config.hasBuyIn, forceLocked, reset]);

  if (!config.hasBuyIn) return <>{children}</>;

  const unlocked = attempt.data?.unlocked === true || (question.bought === true && !forceLocked);
  const buyIn = Number(question.buyIn);
  const balance = session.data?.balance ?? 0;

  function handleEnter() {
    if (balance < buyIn) {
      toast.error(`Not enough coins. You need ${buyIn - balance} more.`);
      return;
    }
    attempt.mutate(undefined, {
      onSuccess: outcome => {
        if (outcome.unlocked) return;
        if (outcome.roundNotRunning) {
          toast.error(ROUND_NOT_RUNNING);
          return;
        }
        toast.error(
          outcome.insufficientBalance
            ? `Not enough coins. You need ${buyIn - balance} more.`
            : BET_FAILED
        );
      },
      onError: error =>
        toast.error(
          isNotQualifiedError(error) ? 'This round is not open for your account.' : BET_FAILED
        ),
    });
  }

  return (
    <BuyInLockContext
      value={{
        locked: !unlocked,
        prompt: (
          <BuyInConfirm
            buyIn={buyIn}
            balance={balance}
            onEnter={handleEnter}
            backHref="/dashboard"
            isPending={attempt.isPending}
          />
        ),
      }}
    >
      {children}
    </BuyInLockContext>
  );
}
