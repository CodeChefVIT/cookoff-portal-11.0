import Image from 'next/image';

import { cn } from '@/lib/utils';

import { DashboardPanel, PanelHeading } from './DashboardPanel';

interface Props {
  className?: string;
  roundQualified: number;
}

// No /getTime endpoint exists yet (see src/api/timer.ts) — hardcoded to the frame's value until it does.
const TIME_REMAINING = '00:50:45';

const LABEL =
  "absolute font-scratch-sans leading-[24.688px] font-bold text-center [font-variation-settings:'opsz'_14]";

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
          <span className="w-[128px] shrink-0 font-scratch-sans text-[25px] leading-normal font-bold tracking-[0.5px] text-white tabular-nums [font-variation-settings:'opsz'_14]">
            {TIME_REMAINING}
          </span>
        </div>
      </div>
    </DashboardPanel>
  );
}
