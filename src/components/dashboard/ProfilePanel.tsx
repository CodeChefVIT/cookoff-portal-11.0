import Image from 'next/image';

import { cn } from '@/lib/utils';

import { DashboardPanel, PanelHeading } from './DashboardPanel';

interface Props {
  className?: string;
  name: string;
  email: string;
  /** Lifetime, cumulative across every round. */
  score: number;
  roundQualified: number;
  /** Points banked from answered questions in the current round. */
  earnedPoints: number;
  /** Every point on offer in the current round. */
  totalPoints: number;
}

const DETAIL_TEXT =
  "absolute left-[73px] right-[28px] h-[34.685px] truncate font-scratch-sans text-[24px] leading-normal font-bold tracking-[0.48px] text-dash-ink [font-variation-settings:'opsz'_14]";

// Figma 323:1916. Coordinates are relative to the panel's top-left (frame 19, 345).
export function ProfilePanel({
  className,
  name,
  email,
  score,
  roundQualified,
  earnedPoints,
  totalPoints,
}: Props) {
  return (
    <DashboardPanel
      title="Profile"
      glow
      gradientStop="to-[69.231%]"
      className={cn('h-[640px] w-[356px] max-w-full shrink-0', className)}
    >
      <PanelHeading className="absolute top-[27px] left-[28px] opacity-90">PROFILE</PanelHeading>

      <div
        aria-hidden
        className="absolute top-[142.71px] left-[135.02px] size-[76.54px] bg-code-sand mask-size-[76.54px_76.54px] mask-no-repeat opacity-90"
        style={{ maskImage: 'url("/dashboard/avatar-mask.png")' }}
      />
      <div
        aria-hidden
        className="absolute top-[125.73px] left-[152.07px] flex h-[50.57px] w-[56.45px] items-center justify-center"
      >
        <div className="relative h-[41.58px] w-[44.81px] flex-none -scale-x-100 rotate-[14.2deg] skew-x-[3.94deg] opacity-90">
          <Image src="/dashboard/chef-hat.svg" alt="" fill unoptimized />
        </div>
      </div>

      <p className="absolute inset-x-0 top-[260px] h-[32px] truncate px-[28px] text-center font-sans text-[24px] leading-normal font-bold text-dash-ink uppercase opacity-90">
        {name}
      </p>

      {/*
        Email moves up into the first detail slot (Figma's user-id row, 353.57)
        now that the id is gone, keeping its original 5.25px icon-to-text offset
        so the row reads the same — just directly under the name.
      */}
      <Image
        src="/dashboard/email.png"
        alt=""
        width={24}
        height={24}
        className="absolute top-[358.82px] left-[31px] size-[24px] max-w-none object-cover opacity-90"
      />
      <p className={cn(DETAIL_TEXT, 'top-[353.57px]')} title={email}>
        <span className="sr-only">Email: </span>
        {email}
      </p>

      <p className="absolute top-[558px] left-[121px] h-[29px] w-[114px] text-center font-scratch-sans text-[20px] leading-normal font-bold tracking-[0.4px] whitespace-nowrap text-dash-ink opacity-90 [font-variation-settings:'opsz'_14]">
        <span className="sr-only">Score: </span>
        {score}
      </p>

      {/*
        The score above is lifetime and cumulative across rounds, so it has no
        matching denominator — `GET /dashboard` only returns the current round's
        questions. This bar therefore tracks *this round's* points instead, which
        is the only total the API exposes, and is labelled as such so the two
        numbers can't be mistaken for each other.
      */}
      {totalPoints > 0 && (
        <div className="absolute inset-x-[28px] top-[597px]">
          <p className="flex justify-between font-scratch-sans text-[14px] leading-normal font-bold tracking-[0.28px] text-dash-ink opacity-90 [font-variation-settings:'opsz'_14]">
            <span>Round {roundQualified}</span>
            <span>
              <span className="sr-only">: </span>
              {earnedPoints} / {totalPoints}
            </span>
          </p>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={totalPoints}
            aria-valuenow={earnedPoints}
            aria-label={`Round ${roundQualified} points`}
            className="mt-[6px] h-[8px] w-full overflow-hidden rounded-full bg-dash-ink/20"
          >
            <div
              className="h-full rounded-full bg-code-sand transition-[width] duration-500 motion-reduce:transition-none"
              style={{ width: `${Math.round((earnedPoints / totalPoints) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </DashboardPanel>
  );
}
