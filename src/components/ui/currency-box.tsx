import Image from 'next/image';

import { cn } from '@/lib/utils';

/**
 * SHARED UI - Currency Box
 *
 * The balance block from Figma `Desktop - 15` (312:1101): a coin stack
 * overhanging a 158×55.4 #363636 card, balance in DM Sans Black 32px. Only
 * rendered when `RoundConfig.hasCurrency` is true (Round 2).
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
        'relative h-10 w-[114px] shrink-0 rounded-[10px] bg-code-coin-box shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] lg:h-[55.4px] lg:w-[158px]',
        className
      )}
    >
      <Image
        src="/code-round/coin.svg"
        alt=""
        width={79}
        height={79}
        unoptimized
        className="absolute top-[-10px] left-[-3px] size-[57px] max-w-none lg:top-[-14px] lg:left-[-4px] lg:size-[79px]"
      />
      <span className="absolute top-[8px] left-[48px] font-scratch-sans text-[23px] leading-[24.688px] font-black text-code-coin-ink [font-variation-settings:'opsz'_14] lg:top-[15px] lg:left-[67px] lg:text-[32px]">
        {balance}
      </span>
    </div>
  );
}
