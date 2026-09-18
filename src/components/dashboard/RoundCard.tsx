import Image from 'next/image';

import { cn } from '@/lib/utils';

import type { RoundCardState, RoundStats } from './dashboard-stats';
import { ProgressRing } from './ProgressRing';

interface Props {
  round: number;
  state: RoundCardState;
  /** Only known for the current round — `GET /dashboard` scopes questions to it. */
  stats: RoundStats;
}

// Stand-in stats painted under a locked card's blur, copied from the frame (323:1859).
const LOCKED_BACKDROP: RoundStats = {
  completed: 3,
  incomplete: 1,
  percent: 75,
  score: 20,
  totalPoints: 0,
};

const OVERLAY_TEXT =
  "font-scratch-sans text-[16.197px] leading-normal font-bold text-white [font-variation-settings:'opsz'_14]";

// Figma `r0` (323:1893 open, 323:1859 locked). Coordinates are relative to the
// card's top-left; the 284.98×233.33 card sits in the Statistics grid.
export function RoundCard({ round, state, stats }: Props) {
  const title = `ROUND ${round}`;

  return (
    <article aria-label={`Round ${round}`} className="relative h-[233.334px] w-[284.984px]">
      <div
        aria-hidden={state === 'locked'}
        className={cn('absolute inset-0', state === 'locked' && 'blur-[4px]')}
      >
        <div className="absolute inset-0 rounded-[9.845px] border-2 border-dash-card-border bg-dash-card opacity-90" />
        <h3 className="absolute top-[25px] left-[19px] font-scratch-sans text-[25px] leading-[24.688px] font-semibold whitespace-nowrap text-dash-label opacity-90 [font-variation-settings:'opsz'_14]">
          {title}
        </h3>
        <span
          className={cn(
            'absolute top-[33.12px] left-[209.85px] size-[9.099px] rounded-full opacity-90',
            state === 'current' ? 'bg-code-passed-text' : 'bg-dash-closed'
          )}
        />
        <span className="absolute top-[32px] left-[222.59px] font-sans text-[9.447px] leading-normal font-bold whitespace-nowrap text-white opacity-90">
          {state === 'current' ? 'Open' : 'Closed'}
        </span>
        {state !== 'over' && (
          <RoundStatsBody stats={state === 'locked' ? LOCKED_BACKDROP : stats} />
        )}
      </div>

      {state === 'locked' && (
        <div className="absolute top-[79px] left-[69px] flex w-[145.659px] flex-col items-center gap-[21px]">
          <Image
            src="/dashboard/lock.svg"
            alt=""
            width={28}
            height={35}
            unoptimized
            className="h-[35px] w-[28px]"
          />
          <p className={cn(OVERLAY_TEXT, 'w-[210px] shrink-0 text-center')}>This Round is Locked</p>
        </div>
      )}
      {state === 'over' && (
        <p
          className={cn(OVERLAY_TEXT, 'absolute top-[135px] left-[37.33px] w-[210px] text-center')}
        >
          This Round is Over
        </p>
      )}
    </article>
  );
}

function RoundStatsBody({ stats }: { stats: RoundStats }) {
  const line =
    'absolute left-[124.62px] font-sans text-[15.753px] leading-normal font-bold whitespace-nowrap text-white opacity-90';

  return (
    <>
      <ProgressRing percent={stats.percent} />
      <Image
        src="/dashboard/check.svg"
        alt=""
        width={22}
        height={22}
        unoptimized
        className="absolute top-[89.68px] left-[96.36px] size-[22.15px] max-w-none opacity-90"
      />
      <p className={cn(line, 'top-[90.83px]')}>Completed: {stats.completed}</p>
      <Image
        src="/dashboard/cross.svg"
        alt=""
        width={21}
        height={21}
        unoptimized
        className="absolute top-[113.78px] left-[97.3px] size-[21.408px] max-w-none opacity-90"
      />
      <p className={cn(line, 'top-[115.4px]')}>Incomplete: {stats.incomplete}</p>
      <p className="absolute top-[189px] left-[15.59px] font-scratch-sans text-[18.894px] leading-normal font-bold whitespace-nowrap text-white opacity-90 [font-variation-settings:'opsz'_14]">
        Score: {stats.score}
      </p>
    </>
  );
}
