import { cn } from '@/lib/utils';

import type { VisualSubmissionResult } from '../types';

export interface VisualVerdictProps {
  result?: VisualSubmissionResult;
  isSubmitting: boolean;
}

/** Inline result banner for the chain — the visual-round counterpart of `TestcasePanel`'s verdict banner (R2/R3). */
export function VisualVerdict({ result, isSubmitting }: VisualVerdictProps) {
  if (isSubmitting) {
    return (
      <p role="status" className="text-sm text-muted-foreground">
        Checking your chain…
      </p>
    );
  }

  if (!result) return null;

  if (result.alreadyAnswered) {
    return (
      <p role="status" className="text-sm text-muted-foreground">
        Already solved — no additional payout for this resubmission.
      </p>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'rounded-lg px-3 py-2 text-sm font-medium',
        result.correct ? 'bg-primary/15 text-primary' : 'bg-destructive/15 text-destructive'
      )}
    >
      {result.correct
        ? `Correct! +${result.pointsAwarded} points.`
        : 'Not quite — rearrange your chain and try again.'}
    </div>
  );
}
