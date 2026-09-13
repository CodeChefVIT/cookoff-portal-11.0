'use client';

import { Dialog } from '@base-ui/react/dialog';

import type { SubmissionVerdict } from '@/api';
import { buttonVariants } from '@/components/ui/button';

import type { Question } from './types';

/**
 * SHARED RESULT MODAL
 *
 * First-solve payout celebration only — the full verdict (pass/fail per
 * case) renders inline in `TestcasePanel`, matching Desktop - 15.png. Never
 * shows payout copy for `alreadyAnswered` (payout fires once, LLD §2.6).
 */
export interface ResultModalProps {
  open: boolean;
  onClose: () => void;
  result: SubmissionVerdict;
  question: Question;
}

export function ResultModal({ open, onClose, result, question }: ResultModalProps) {
  const allPassed = result.testcasesFailed === 0 && result.testcasesPassed > 0;
  if (!allPassed) return null;

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
          {!result.alreadyAnswered ? (
            <div className="mt-4 flex justify-center gap-6 text-sm">
              <span className="text-primary">+{question.points} score</span>
              {Number(question.reward) > 0 && (
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
