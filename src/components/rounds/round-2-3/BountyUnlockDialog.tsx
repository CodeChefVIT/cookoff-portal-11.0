'use client';

import { Dialog } from '@base-ui/react/dialog';

import { Button } from '@/components/ui/button';

/**
 * Shown the first time a contestant opens a question with `bountyActive`
 * (`dto.QuestionResponse.bounty_active`, toggled by an admin at
 * `POST /question/:id/bounty/activate`). The backend only exposes the
 * boolean flag — there is no "first N correct submissions" counter or
 * bonus-payout endpoint, so entering a bounty is presentation only: it
 * clears the current draft (matching the copy's warning) and proceeds into
 * the normal submit flow. Any bonus-scoring rule the copy references would
 * need a backend change this PR doesn't make.
 */
export interface BountyUnlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEnter: () => void;
  onStayHere: () => void;
}

export function BountyUnlockDialog({
  open,
  onOpenChange,
  onEnter,
  onStayHere,
}: BountyUnlockDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/60" />
        <Dialog.Popup
          className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-6 text-center text-card-foreground"
          role="alertdialog"
        >
          <Dialog.Title className="font-display text-xl text-brand">
            Unlock this question?
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-muted-foreground">
            A special challenge has just unlocked! Attempt it for extra points, but beware: your
            current code will be erased if you enter. Only the first 10 correct submissions earn the
            bonus.
          </Dialog.Description>
          <p className="mt-2 text-sm text-muted-foreground">Do you want to jump in?</p>
          <div className="mt-6 flex justify-center gap-2">
            <Button variant="secondary" onClick={onStayHere}>
              Stay Here
            </Button>
            <Button onClick={onEnter}>Enter Bounty</Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
