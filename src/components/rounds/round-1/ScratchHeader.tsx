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
    <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 px-4 pt-4 lg:flex-nowrap lg:pt-[39px] lg:pr-[47px] lg:pl-[31px]">
      <div className="flex min-w-0 items-center gap-[11px] lg:mt-px">
        <Image
          src="/cc%203.svg"
          alt="CodeChef-VIT"
          width={75}
          height={75}
          unoptimized
          priority
          className="size-12 shrink-0 lg:size-[75px]"
        />
        <span className="font-wordmark text-[28px] leading-none font-black whitespace-nowrap text-brand sm:text-[40px] lg:text-[52px] lg:leading-[75px] xl:text-[min(90px,6.25vw)]">
          COOK OFF <span className="text-brand-accent">11.0</span>
        </span>
      </div>
      <div className="flex items-center gap-4 lg:gap-[48px]">
        <RoundTimer variant="box" />
        {headerAction}
      </div>
    </header>
  );
}
