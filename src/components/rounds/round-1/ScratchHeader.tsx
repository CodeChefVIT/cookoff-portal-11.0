import type { ReactNode } from 'react';
import Image from 'next/image';

import { RoundTimer } from '../RoundTimer';

export interface ScratchHeaderProps {
  /** The header Submit button (`RoundConfig.headerSubmit`). */
  headerAction?: ReactNode;
}

/**
 * Round 1 header from Figma frame `scratch` (312:1042): CodeChef logo,
 * Cinzel wordmark, boxed timer and Submit. No logout or round badge — the
 * design has neither. Wraps onto two rows below `lg` so it never scrolls
 * horizontally on a phone.
 */
export function ScratchHeader({ headerAction }: ScratchHeaderProps) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 border-b-2 border-scratch-rule px-4 pt-4 pb-3 lg:flex-nowrap lg:pt-[24px] lg:pr-[47px] lg:pb-[8px] lg:pl-[31px]">
      <div className="flex min-w-0 items-center gap-[11px] lg:mt-px">
        <Image
          src="/cc%203.svg"
          alt="CodeChef-VIT"
          width={60}
          height={60}
          unoptimized
          priority
          className="size-12 shrink-0 lg:size-[60px]"
        />
        <span className="font-wordmark text-[28px] leading-none font-black whitespace-nowrap text-code-brand sm:text-[40px] lg:text-[44px] lg:leading-[60px] xl:text-[min(72px,5vw)]">
          COOK OFF <span className="text-brand-accent">11.0</span>
        </span>
      </div>
      <div className="flex items-center gap-4 lg:gap-[36px]">
        <RoundTimer variant="box" />
        {headerAction}
      </div>
    </header>
  );
}
