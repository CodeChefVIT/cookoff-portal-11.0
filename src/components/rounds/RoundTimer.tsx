'use client';

import Image from 'next/image';
import { cva, type VariantProps } from 'class-variance-authority';

import { useMounted } from '@/hooks/use-mounted';
import { cn } from '@/lib/utils';

import { useRoundTimer } from './hooks';

const roundTimerVariants = cva('flex items-center tabular-nums', {
  variants: {
    variant: {
      pill: 'gap-2 rounded-full bg-round-badge px-3 py-1 font-mono text-sm text-foreground',
      // Right-hand segment of a joined `Round N | 00:11:52` pill (RoundHeader)
      // — same field colour as `pill`, but only the trailing corners round.
      joined: 'gap-2 rounded-r-full bg-round-badge px-3 py-1 font-mono text-sm text-foreground',
      // Figma `scratch` timer at 80% scale: 2px border, gradient fill, clock + "TIME LEFT".
      box: "h-[52px] gap-2 rounded-[8px] border-2 border-scratch-border bg-linear-to-b from-scratch-timer-from to-scratch-panel-end px-3 font-scratch-sans text-white shadow-(--scratch-timer-shadow) [font-variation-settings:'opsz'_14] lg:h-[56px] lg:w-[160px] lg:items-end lg:justify-between lg:px-[12px] lg:pt-[7px] lg:pb-[5px]",
    },
  },
  defaultVariants: { variant: 'pill' },
});

export interface RoundTimerProps extends VariantProps<typeof roundTimerVariants> {
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
export function RoundTimer({ onExpire, className, variant }: RoundTimerProps) {
  const mounted = useMounted();
  const { remaining, isUrgent, isExpired, isError } = useRoundTimer(onExpire);

  const label = !mounted || remaining === null ? '—:—:—' : formatRemaining(remaining);
  const time = (
    <span aria-label={isError ? 'Round clock unavailable' : `Time remaining ${label}`}>
      {label}
    </span>
  );

  return (
    <div
      className={cn(
        roundTimerVariants({ variant }),
        isUrgent && !isExpired && 'text-destructive',
        className
      )}
    >
      {variant === 'box' ? (
        <>
          <Image
            src="/clock.svg"
            unoptimized
            alt=""
            aria-hidden="true"
            width={36}
            height={36}
            className="size-8 shrink-0 lg:size-[36px]"
          />
          <span className="flex flex-col leading-normal lg:w-[92px]">
            <span className="text-lg font-medium tracking-[0.5px] lg:text-[20px]">{time}</span>
            <span className="text-[10px] font-light tracking-[0.26px] lg:text-[11px]">
              {isError ? 'CLOCK UNAVAILABLE' : 'TIME LEFT'}
            </span>
          </span>
        </>
      ) : (
        <>
          {variant !== 'joined' && <span aria-hidden="true">⏱</span>}
          {time}
          {isError && <span className="text-xs text-muted-foreground">clock unavailable</span>}
        </>
      )}
    </div>
  );
}
