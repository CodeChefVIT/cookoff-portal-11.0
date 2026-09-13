'use client';

import { Dialog } from '@base-ui/react/dialog';

import { Button, buttonVariants } from '@/components/ui/button';

/**
 * Confirmation gate before `Submit Code` fires (design: "Confirm Final
 * Submission" modal — Cancel / Submit Code). Resubmission after a solve is
 * still allowed server-side (LLD §2.6), so the copy stays generic rather
 * than claiming this is literally the only submission ever permitted.
 */
export interface ConfirmSubmitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export function ConfirmSubmitDialog({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting,
}: ConfirmSubmitDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/60" />
        <Dialog.Popup
          className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-6 text-center text-card-foreground"
          role="alertdialog"
        >
          <Dialog.Title className="font-display text-xl text-brand">
            Confirm Final Submission
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-muted-foreground">
            Are you sure you want to submit your code?
          </Dialog.Description>
          <div className="mt-6 flex justify-center gap-2">
            <Dialog.Close className={buttonVariants({ variant: 'ghost' })}>Cancel</Dialog.Close>
            <Button onClick={onConfirm} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting…' : 'Submit Code'}
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
