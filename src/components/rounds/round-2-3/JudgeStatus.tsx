import { isTerminalStatus, JUDGE0_LABELS } from '@/api';

export interface JudgeStatusProps {
  statusId?: number;
  isPolling: boolean;
  pollCapExceeded: boolean;
  onRetry?: () => void;
}

/** Judge0 id -> human label. `role="status"` announces the verdict once, not per poll tick. */
export function JudgeStatus({ statusId, isPolling, pollCapExceeded, onRetry }: JudgeStatusProps) {
  if (pollCapExceeded) {
    return (
      <div role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Taking longer than expected.</span>
        <button type="button" onClick={onRetry} className="underline">
          Check again
        </button>
      </div>
    );
  }

  if (!statusId) return null;

  const label = JUDGE0_LABELS[statusId] ?? 'Unknown';
  const terminal = isTerminalStatus(statusId);

  return (
    <div role="status" aria-live="polite" className="text-sm text-muted-foreground">
      {terminal ? label : `${label}${isPolling ? '…' : ''}`}
    </div>
  );
}
