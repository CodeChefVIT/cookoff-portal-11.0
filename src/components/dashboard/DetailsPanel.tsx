'use client';

import Image from 'next/image';

import { useRoundTimeQuery, useRoundTimer } from '@/components/rounds/hooks';
import { formatRemaining } from '@/components/rounds/RoundTimer';
import { useMounted } from '@/hooks/use-mounted';
import { cn } from '@/lib/utils';

import { DashboardPanel, PanelHeading } from './DashboardPanel';

interface Props {
  className?: string;
  roundQualified: number;
}

const LABEL =
  "absolute font-scratch-sans leading-[24.688px] font-bold text-center [font-variation-settings:'opsz'_14]";

/**
 * Live countdown for the player's current round. The dashboard has no
 * `RoundGate`, so this panel owns the `/getTime` resync here. Shows dashes
 * while the clock is loading, the round isn't running, or the running timer
 * belongs to a different round.
 */
function TimeRemaining({ roundQualified }: { roundQualified: number }) {
  const time = useRoundTimeQuery({ sync: true });
  const mounted = useMounted();
  const { remaining, isUrgent, isExpired } = useRoundTimer();
  const timerRound = time.data?.round;
  const showsThisRound = timerRound === undefined || timerRound === roundQualified;
  const label =
    mounted && remaining !== null && showsThisRound ? formatRemaining(remaining) : '--:--:--';

  return (
    <span
      aria-label={`Time remaining ${label}`}
      className={cn(
        "w-[128px] shrink-0 font-scratch-sans text-[25px] leading-normal font-bold tracking-[0.5px] text-white tabular-nums [font-variation-settings:'opsz'_14]",
        showsThisRound && isUrgent && !isExpired && 'text-destructive'
      )}
    >
      {label}
    </span>
  );
}

// Figma 323:1941 + 323:1956–323:1968. Coordinates are relative to the panel's
// top-left (frame 1084, 345).
export function DetailsPanel({ className, roundQualified }: Props) {
  return (
    <DashboardPanel
      title="Details"
      gradientStop="to-[73.558%]"
      className={cn('h-[631px] w-[337px] max-w-full shrink-0', className)}
    >
      <PanelHeading className="absolute top-[29px] left-[30px]">DETAILS</PanelHeading>

      <p className={cn(LABEL, 'top-[171px] left-[7px] w-[209px] text-[20px] text-dash-label')}>
        CURRENT ROUND
      </p>
      <p
        className={cn(
          LABEL,
          'top-[209px] left-[96.5px] -translate-x-1/2 text-[32px] whitespace-nowrap text-dash-value'
        )}
      >
        ROUND {roundQualified}
      </p>
      <p
        className={cn(
          LABEL,
          'top-[253px] left-[114.5px] -translate-x-1/2 text-[20px] whitespace-pre text-dash-label'
        )}
      >
        {'TIME REMAINING:  '}
      </p>

      <div className="absolute top-[295px] left-[27px] h-[69px] w-[280px]">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-[68.652px] rounded-[8px] border-2 border-scratch-border bg-dash-glow opacity-8 blur-[10px]"
        />
        <div
          aria-hidden
          className="absolute inset-0 rounded-[8px] border-2 border-scratch-border bg-linear-to-b from-scratch-timer-from to-scratch-panel-end"
        />
        <div className="absolute top-[11px] left-[50px] flex w-[251.594px] items-center gap-[13px]">
          <Image
            src="/dashboard/clock.png"
            alt=""
            width={45}
            height={45}
            className="size-[45px] shrink-0 object-cover"
          />
          <TimeRemaining roundQualified={roundQualified} />
        </div>
      </div>
    </DashboardPanel>
  );
}
