'use client';

import { useMounted } from '@/hooks/use-mounted';
import { cn } from '@/lib/utils';

import { useRoundTimer } from './hooks';

export interface RoundTimerProps {
  onExpire?: () => void;
  className?: string;
}

function formatRemaining(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value: number) => value.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Server-offset countdown (see AGENTS.md: the client clock is never
 * trusted). `useMounted` guards the ticking value against a hydration
 * mismatch. Not `aria-live` per-second — a live region ticking every second
 * is a screen-reader denial of service; only urgency crossing is announced.
 */
export function RoundTimer({ onExpire, className }: RoundTimerProps) {
  const mounted = useMounted();
  const { remaining, isUrgent, isExpired, isError } = useRoundTimer(onExpire);

  const label = !mounted || remaining === null ? '—:—:—' : formatRemaining(remaining);

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-full bg-round-badge px-3 py-1 font-mono text-sm text-foreground tabular-nums',
        isUrgent && !isExpired && 'text-destructive',
        className
      )}
    >
      <span aria-hidden="true">⏱</span>
      <span aria-label={isError ? 'Round clock unavailable' : `Time remaining ${label}`}>
        {label}
      </span>
      {isError && <span className="text-xs text-muted-foreground">clock unavailable</span>}
    </div>
  );
}
