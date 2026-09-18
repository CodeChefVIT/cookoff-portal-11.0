export interface VisualVerdictProps {
  isSubmitting: boolean;
}

/**
 * Inline "checking" status under the chain. Neither verdict is announced here
 * any more — `VerdictBox` shows both, so a wrong answer gets the same weight as
 * a right one instead of a small banner beneath the workspace.
 */
export function VisualVerdict({ isSubmitting }: VisualVerdictProps) {
  if (!isSubmitting) return null;

  return (
    <p role="status" className="text-sm text-muted-foreground">
      Checking your chain…
    </p>
  );
}
