'use client';

import { Dialog } from '@base-ui/react/dialog';

import { buttonVariants } from '@/components/ui/button';

import type { Question } from './types';

/**
 * SHARED RESULT MODAL
 *
 * First-solve payout celebration, shared by every round's engine (R1's
 * `ScratchEngine` and R2/R3's `CodeEngine`) — the full verdict (pass/fail
 * per testcase, or the visual chain's correctness) renders inline in each
 * engine, matching the Figma. Never shows payout copy for `alreadyAnswered`
 * (payout fires once, LLD §2.6). The caller decides *when* to open this —
 * it renders unconditionally once mounted.
 */
export interface ResultModalProps {
  open: boolean;
  onClose: () => void;
  question: Question;
  pointsAwarded: number;
  alreadyAnswered: boolean;
  /** Round 3 has no reward (`RoundConfig.hasCurrency` is false). */
  showReward?: boolean;
}

export function ResultModal({
  open,
  onClose,
  question,
  pointsAwarded,
  alreadyAnswered,
  showReward = true,
}: ResultModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={next => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/60" />
        <Dialog.Popup
          className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-6 text-center text-card-foreground"
          role="status"
        >
          <div aria-hidden="true" className="text-4xl">
            🎉
          </div>
          <Dialog.Title className="mt-2 font-display text-2xl text-brand">Solved!</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-muted-foreground">
            {question.title}
          </Dialog.Description>
          {!alreadyAnswered ? (
            <div className="mt-4 flex justify-center gap-6 text-sm">
              <span className="text-primary">+{pointsAwarded} score</span>
              {showReward && Number(question.reward) > 0 && (
                <span className="text-coin">+{question.reward} coins</span>
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              Already solved — no additional payout for this resubmission.
            </p>
          )}
          <Dialog.Close className={`${buttonVariants({})} mt-6`}>Continue</Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
