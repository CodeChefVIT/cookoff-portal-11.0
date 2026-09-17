'use client';

import type { CSSProperties } from 'react';
import { useId } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';

export interface BuyInConfirmProps {
  /** Coins this question costs to enter. */
  buyIn: number;
  onEnter: () => void;
  /** Where ✕ navigates — the dashboard (rounds have no question list). */
  backHref: string;
  isPending: boolean;
}

const CLOSE_MASK: CSSProperties = {
  maskImage: 'url(/code-round/close.png)',
  WebkitMaskImage: 'url(/code-round/close.png)',
  maskSize: '100% 100%',
  WebkitMaskSize: '100% 100%',
};

const BUTTON =
  'h-12 w-[140px] cursor-pointer rounded-[10px] font-sans text-[20px] leading-[25.075px] font-semibold shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-wait @min-[640px]:w-[180px]';

/**
 * R2 buy-in confirmation from Figma `Group 1707478439` (352:744), centred
 * over the blurred editor + results column (`BuyInLockSurface`) while a
 * question is locked — non-modal, so the problem statement beside it stays
 * readable and scrollable. Exact 621×392 geometry once its container is at
 * least 640px wide (title/close offsets are net of the header bar's 1.77px
 * border); stacks in narrower columns. Only Enter or ✕ act.
 */
export function BuyInConfirm({ buyIn, onEnter, backHref, isPending }: BuyInConfirmProps) {
  const router = useRouter();
  const titleId = useId();
  const descriptionId = useId();

  return (
    <section
      role="dialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="absolute top-1/2 left-1/2 z-30 flex w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-[10px] bg-code-panel pb-6 text-center @min-[640px]:left-[calc(50%-311px)] @min-[640px]:block @min-[640px]:h-[392px] @min-[640px]:w-[621px] @min-[640px]:translate-x-0 @min-[640px]:pb-0"
    >
      <div className="relative h-[68px] w-full shrink-0 rounded-t-[10px] border-[1.77px] border-scratch-rule bg-black @min-[640px]:absolute @min-[640px]:top-0 @min-[640px]:left-0">
        <h2
          id={titleId}
          className="absolute top-[19.23px] left-4 font-inria text-[26px] leading-[25.075px] font-bold whitespace-nowrap text-brand-accent @min-[640px]:left-[95.23px] @min-[640px]:text-[36px]"
        >
          CONFIRM PURCHASE
        </h2>
        <button
          type="button"
          aria-label="Close"
          onClick={() => router.push(backHref)}
          className="absolute top-[19.23px] right-[19.23px] size-[26px] cursor-pointer focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <span aria-hidden="true" style={CLOSE_MASK} className="block size-full bg-white" />
        </button>
      </div>
      <p
        id={descriptionId}
        className="mt-4 px-4 font-sans text-[18px] leading-[30px] font-medium text-white @min-[640px]:absolute @min-[640px]:top-[84px] @min-[640px]:left-[131px] @min-[640px]:mt-0 @min-[640px]:w-[369px] @min-[640px]:px-0"
      >
        Once you use your coins to attempt this question, the coins deducted will not be refunded.
        You must complete the question to earn points.
      </p>
      {/* Figma has only "Do you want to jump in?" here; the cost is added and the line centred. */}
      <p className="mt-6 font-sans text-[18px] leading-[30px] font-medium whitespace-nowrap text-white @min-[640px]:absolute @min-[640px]:top-[248px] @min-[640px]:left-1/2 @min-[640px]:mt-0 @min-[640px]:-translate-x-1/2">
        Spend <span className="font-bold text-brand-accent">{buyIn} coins</span> to jump in?
      </p>
      {/* Go Back was dropped from Figma's pair; Enter is centred in the 621px box instead of at 111px. */}
      <button
        type="button"
        onClick={onEnter}
        disabled={isPending}
        className={cn(
          BUTTON,
          'mt-6 bg-code-enter text-white @min-[640px]:absolute @min-[640px]:top-[304px] @min-[640px]:left-[220.5px] @min-[640px]:mt-0'
        )}
      >
        Enter
      </button>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[10px] border-[1.77px] border-scratch-rule"
      />
      {/* Figma 352:1059 is a separate layer above the box, overhanging the header bar. */}
      <Image
        src="/code-round/coin.svg"
        alt=""
        width={79}
        height={79}
        unoptimized
        className="pointer-events-none absolute top-[-6px] right-14 size-[57px] max-w-none @min-[640px]:top-[-8px] @min-[640px]:right-auto @min-[640px]:left-[422px] @min-[640px]:size-[79px]"
      />
    </section>
  );
}
