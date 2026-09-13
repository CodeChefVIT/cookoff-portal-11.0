export interface JudgeStatusProps {
  /** Overall verdict description from `dto.ResultResponse.description`, e.g. "All 3 testcases passed". */
  description?: string;
  isPolling: boolean;
  timedOut: boolean;
  onRetry?: () => void;
}

/**
 * `GET /result/:id` long-polls server-side and returns a terminal verdict
 * directly — no Judge0 numeric status id to map here. `role="status"`
 * announces the verdict once, not per poll tick.
 */
export function JudgeStatus({ description, isPolling, timedOut, onRetry }: JudgeStatusProps) {
  if (timedOut) {
    return (
      <div role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Taking longer than expected.</span>
        <button type="button" onClick={onRetry} className="underline">
          Check again
        </button>
      </div>
    );
  }

  if (isPolling) {
    return (
      <div role="status" aria-live="polite" className="text-sm text-muted-foreground">
        Judging your submission…
      </div>
    );
  }

  if (!description) return null;

  return (
    <div role="status" aria-live="polite" className="text-sm text-muted-foreground">
      {description}
    </div>
  );
}
