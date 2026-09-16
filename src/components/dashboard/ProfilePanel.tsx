import Image from 'next/image';

import { cn } from '@/lib/utils';

import { DashboardPanel, PanelHeading } from './DashboardPanel';

interface Props {
  className?: string;
  name: string;
  userId: string;
  email: string;
  score: number;
}

const DETAIL_TEXT =
  "absolute left-[73px] right-[28px] h-[34.685px] truncate font-scratch-sans text-[24px] leading-normal font-bold tracking-[0.48px] text-dash-ink [font-variation-settings:'opsz'_14]";

// Figma 323:1916. Coordinates are relative to the panel's top-left (frame 19, 345).
export function ProfilePanel({ className, name, userId, email, score }: Props) {
  return (
    <DashboardPanel
      title="Profile"
      glow
      gradientStop="to-[69.231%]"
      className={cn('h-[640px] w-[356px] max-w-full shrink-0', className)}
    >
      <PanelHeading className="absolute top-[27px] left-[28px] opacity-90">PROFILE</PanelHeading>
      <Image
        src="/dashboard/edit.svg"
        alt=""
        aria-hidden
        width={25}
        height={28}
        unoptimized
        className="absolute top-[26.8px] left-[303px] h-[28.06px] w-[25.04px] max-w-none opacity-90"
      />

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

      <div
        aria-hidden
        className="absolute top-[357.66px] left-[30.3px] size-[25.387px] bg-code-sand mask-size-[25.387px_25.386px] mask-no-repeat"
        style={{ maskImage: 'url("/dashboard/user-mask.png")' }}
      />
      <p className={cn(DETAIL_TEXT, 'top-[353.57px]')} title={userId}>
        <span className="sr-only">User ID: </span>
        {userId}
      </p>

      <Image
        src="/dashboard/email.png"
        alt=""
        width={24}
        height={24}
        className="absolute top-[417px] left-[31px] size-[24px] max-w-none object-cover opacity-90"
      />
      <p className={cn(DETAIL_TEXT, 'top-[411.75px]')} title={email}>
        <span className="sr-only">Email: </span>
        {email}
      </p>

      <p className="absolute top-[558px] left-[121px] h-[29px] w-[114px] text-center font-scratch-sans text-[20px] leading-normal font-bold tracking-[0.4px] whitespace-nowrap text-dash-ink opacity-90 [font-variation-settings:'opsz'_14]">
        <span className="sr-only">Score: </span>
        {score}
      </p>
    </DashboardPanel>
  );
}
