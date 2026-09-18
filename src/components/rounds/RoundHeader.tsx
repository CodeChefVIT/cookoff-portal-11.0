'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { CurrencyBox } from '@/components/ui/currency-box';
import type { RoundId } from '@/types';

import { getRoundConfig } from './round-config';
import { RoundTimer } from './RoundTimer';

export interface RoundHeaderProps {
  roundId: RoundId;
  balance?: number;
  /** R1's Submit button — only rendered when `config.headerSubmit` is true. */
  headerAction?: ReactNode;
}

/**
 * R2/R3 header: logo, Cinzel wordmark, R1's timer box, currency block
 * (`hasCurrency` — Round 2 only) and the avatar, which links to the dashboard. Box, logo, wordmark,
 * padding and gaps are Round 1's `ScratchHeader` verbatim so every round's
 * header has identical dimensions; the right-side items take the height of
 * R1's timer/Submit (52px, 56px from `lg`). Wraps below `lg` like R1.
 */
export function RoundHeader({ roundId, balance, headerAction }: RoundHeaderProps) {
  const config = getRoundConfig(roundId);

  return (
    <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 border-b-2 border-scratch-rule px-4 pt-4 pb-3 lg:flex-nowrap lg:pt-[24px] lg:pr-[47px] lg:pb-[8px] lg:pl-[31px]">
      <div className="flex min-w-0 items-center gap-[11px] lg:mt-px">
        <Image
          src="/code-round/logo.png"
          alt="CodeChef-VIT"
          width={60}
          height={60}
          unoptimized
          priority
          className="size-12 shrink-0 object-cover lg:size-[60px]"
        />
        <span className="font-wordmark text-[28px] leading-none font-black whitespace-nowrap text-code-brand sm:text-[40px] lg:text-[44px] lg:leading-[60px] xl:text-[min(72px,5vw)]">
          COOK OFF <span className="text-brand-accent">11.0</span>
        </span>
      </div>
      <div className="flex items-center gap-4 lg:gap-[36px]">
        <RoundTimer variant="box" />
        {config.hasCurrency && balance !== undefined && <CurrencyBox balance={balance} />}
        {config.headerSubmit && headerAction}
        <Link
          href="/dashboard"
          aria-label="Go to dashboard"
          title="Dashboard"
          className="size-[52px] shrink-0 cursor-pointer rounded-full focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none lg:size-[56px]"
        >
          <Image
            src="/code-round/avatar.svg"
            alt=""
            width={56}
            height={56}
            unoptimized
            className="size-full"
          />
        </Link>
      </div>
    </header>
  );
}
