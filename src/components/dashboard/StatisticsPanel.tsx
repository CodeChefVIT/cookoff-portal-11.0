import Link from 'next/link';

import type { DashboardQuestionSummary } from '@/api/session';
import { cn } from '@/lib/utils';

import { DASHBOARD_ROUNDS, roundCardState, summarizeRound } from './dashboard-stats';
import { DashboardPanel, PanelHeading } from './DashboardPanel';
import { RoundCard } from './RoundCard';

interface Props {
  className?: string;
  roundQualified: number;
  questions: DashboardQuestionSummary[];
}

// Figma 323:1838. Cards start at (34, 89) inside the panel with 23.02px / 52.67px gaps.
export function StatisticsPanel({ className, roundQualified, questions }: Props) {
  const stats = summarizeRound(questions);

  return (
    <DashboardPanel
      title="Statistics"
      glow
      gradientStop="to-[75.481%]"
      className={cn('w-[655px] max-w-full shrink-0 pb-[34px] lg:h-[637px] lg:pb-0', className)}
    >
      <PanelHeading className="absolute top-[29px] left-[34px]">STATISTICS</PanelHeading>
      <div className="relative grid justify-center gap-x-[23.016px] gap-y-[52.666px] px-[16px] pt-[89px] sm:grid-cols-[284.984px_284.984px] lg:justify-start lg:px-[34px]">
        {DASHBOARD_ROUNDS.map(round => {
          const state = roundCardState(round, roundQualified);
          const card = <RoundCard round={round} state={state} stats={stats} />;
          return state === 'current' ? (
            <Link
              key={round}
              href={`/round/${round}`}
              className="rounded-[9.845px] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              {card}
            </Link>
          ) : (
            <div key={round}>{card}</div>
          );
        })}
      </div>
    </DashboardPanel>
  );
}
