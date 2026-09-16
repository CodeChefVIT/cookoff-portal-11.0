import type { VisualSubmissionResult } from '../types';

export interface VisualVerdictProps {
  result?: VisualSubmissionResult;
  isSubmitting: boolean;
}

/**
 * Inline status under the chain while checking, and the wrong-order banner.
 * A correct chain shows nothing here — `SolvedBox` announces it (including
 * the "already solved" case).
 */
export function VisualVerdict({ result, isSubmitting }: VisualVerdictProps) {
  if (isSubmitting) {
    return (
      <p role="status" className="text-sm text-muted-foreground">
        Checking your chain…
      </p>
    );
  }

  if (!result || result.correct) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-lg bg-destructive/15 px-3 py-2 text-sm font-medium text-destructive"
    >
      Not quite — rearrange your chain and try again.
    </div>
  );
}
