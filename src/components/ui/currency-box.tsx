import Image from 'next/image';

import { cn } from '@/lib/utils';

/**
 * SHARED UI - Currency Box
 *
 * The balance block from Figma `Desktop - 15` (312:1101) — a coin stack
 * overhanging a #363636 card, balance in DM Sans Black — scaled to the height
 * of R1's header timer (52px, 56px from `lg`) so it sits in the shared header
 * box. Only rendered when `RoundConfig.hasCurrency` is true (Round 2).
 */
export interface CurrencyBoxProps {
  /** User's in-contest currency balance. */
  balance: number;
  className?: string;
}

export function CurrencyBox({ balance, className }: CurrencyBoxProps) {
  return (
    <div
      aria-label={`Balance: ${balance} coins`}
      className={cn(
        'relative h-[52px] w-[148px] shrink-0 rounded-[10px] bg-code-coin-box shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] lg:h-[56px] lg:w-[160px]',
        className
      )}
    >
      <Image
        src="/code-round/coin.svg"
        alt=""
        width={80}
        height={80}
        unoptimized
        className="absolute top-[-13px] left-[-4px] size-[74px] max-w-none lg:top-[-14px] lg:size-[80px]"
      />
      <span className="absolute top-[14px] left-[63px] font-scratch-sans text-[30px] leading-[24.688px] font-black text-code-coin-ink [font-variation-settings:'opsz'_14] lg:top-[15.8px] lg:left-[68px] lg:text-[32px]">
        {balance}
      </span>
    </div>
  );
}
