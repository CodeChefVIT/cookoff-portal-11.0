'use client';

import {
  DashboardHeader,
  DetailsPanel,
  ProfilePanel,
  StatisticsPanel,
  summarizeRound,
  Timeline,
  useStageZoom,
} from '@/components/dashboard';
import { useSession } from '@/components/rounds/hooks';
import { LoadingScreen } from '@/components/ui';

// Figma `dashboard` (Qc0hMJFVUSxi6jsnhx54Vk, 323:1835). From `lg` every section
// sits at its frame coordinates (minus the 99px header) on a 1440px stage
// zoomed to fit the viewport; below `lg` the same sections stack. Round unlock is still enforced
// server-side by each round's RoundGate — this page is presentation only.
export default function DashboardPage() {
  const session = useSession();
  const zoom = useStageZoom();

  if (!session.data) return <LoadingScreen />;

  const { name, email, score, roundQualified, questions } = session.data;
  // Current-round points for the profile bar — the lifetime `score` has no
  // denominator, since /dashboard only returns this round's questions.
  const roundStats = summarizeRound(questions);

  return (
    <div className="relative min-h-dvh bg-dash-bg lg:h-dvh lg:overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-dash-veil opacity-15" />
      <div className="relative">
        <DashboardHeader zoom={zoom} />
        <div
          className="relative mx-auto flex flex-col items-center gap-10 px-4 pt-6 pb-10 lg:block lg:h-[925px] lg:w-[1440px] lg:p-0"
          style={zoom === null ? undefined : { zoom }}
        >
          <div className="w-full lg:absolute lg:top-[116px] lg:left-[124px] lg:w-auto">
            <Timeline roundQualified={roundQualified} />
          </div>
          <div className="mt-8 flex w-full flex-col items-center gap-6 lg:contents">
            <ProfilePanel
              name={name || email}
              email={email}
              score={score}
              roundQualified={roundQualified}
              earnedPoints={roundStats.score}
              totalPoints={roundStats.totalPoints}
              className="lg:absolute lg:top-[246px] lg:left-[19px]"
            />
            <StatisticsPanel
              roundQualified={roundQualified}
              questions={questions}
              className="lg:absolute lg:top-[246px] lg:left-[410px]"
            />
            <DetailsPanel
              roundQualified={roundQualified}
              className="lg:absolute lg:top-[246px] lg:left-[1084px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
