'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Dialog } from '@base-ui/react/dialog';

import { isApiError } from '@/api';
import { Button, buttonVariants } from '@/components/ui/button';

import { useAttempt, useSession } from './hooks';
import { getRoundConfig } from './round-config';
import type { Question, RoundId } from './types';

/**
 * SHARED BUY-IN GATE
 *
 * R2: gates `children` behind `POST /attempts/:id`. R1/R3
 * (`RoundConfig.hasBuyIn === false`) are pass-throughs — never a bet button,
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
  const [open, setOpen] = useState(false);

  const { mutate: unlock, isIdle } = attempt;
  const autoUnlock = config.autoAttempt && question.bought !== true;
  useEffect(() => {
    if (autoUnlock && isIdle) unlock();
  }, [autoUnlock, isIdle, unlock]);

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

  const alreadyBought = question.bought === true || attempt.isSuccess;
  const unlocked = alreadyBought && !forceLocked;

  const buyIn = Number(question.buyIn);
  const balance = session.data?.balance ?? 0;
  const shortfall = attempt.data?.insufficientBalance === true;

  if (unlocked) {
    return <>{children}</>;
  }

  return (
    <div
      className="relative flex min-h-[50dvh] flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card/60 p-8 text-center"
      aria-label="Question locked"
    >
      <div aria-hidden="true" className="text-3xl">
        🔒
      </div>
      {forceLocked && (
        <p role="alert" className="text-sm text-destructive">
          The server didn&rsquo;t recognize your bet — place it again before submitting.
        </p>
      )}
      <p className="text-sm text-muted-foreground">
        Place a bet of <strong className="text-coin">{buyIn} coins</strong> to unlock the editor.
      </p>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger className={buttonVariants({})}>Place Bet · {buyIn} coins</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 bg-black/60" />
          <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-6 text-card-foreground">
            <Dialog.Title className="font-display text-xl text-brand">Place your bet</Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-muted-foreground">
              This buy-in isn&rsquo;t refunded on a wrong answer. Confirm to unlock the code editor.
            </Dialog.Description>
            <dl className="mt-4 space-y-1 text-sm">
              <div className="flex justify-between">
                <dt>Bet</dt>
                <dd>{buyIn} coins</dd>
              </div>
              <div className="flex justify-between">
                <dt>Current balance</dt>
                <dd>{balance} coins</dd>
              </div>
              <div className="flex justify-between font-medium">
                <dt>Balance after bet</dt>
                <dd>{Math.max(0, balance - buyIn)} coins</dd>
              </div>
            </dl>
            {shortfall && (
              <p role="alert" className="mt-3 text-sm text-destructive">
                Not enough coins — you need {buyIn - balance} more.
              </p>
            )}
            {attempt.isError && !isApiError(attempt.error) && (
              <p role="alert" className="mt-3 text-sm text-destructive">
                Couldn&rsquo;t place your bet. Try again.
              </p>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <Dialog.Close className={buttonVariants({ variant: 'ghost' })}>Cancel</Dialog.Close>
              <Button
                onClick={() => attempt.mutate(undefined, { onSuccess: () => setOpen(false) })}
                disabled={attempt.isPending || balance < buyIn}
              >
                {attempt.isPending ? 'Confirming…' : 'Confirm'}
              </Button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
