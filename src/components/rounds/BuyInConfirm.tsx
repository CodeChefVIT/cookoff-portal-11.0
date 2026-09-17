'use client';

import type { CSSProperties } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Dialog } from '@base-ui/react/dialog';

import { cn } from '@/lib/utils';

export interface BuyInConfirmProps {
  onEnter: () => void;
  /** Where Go Back / ✕ / Esc navigate — the round's question list. */
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
  'h-12 w-[140px] cursor-pointer rounded-[10px] font-sans text-[20px] leading-[25.075px] font-semibold shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-wait sm:w-[180px]';

/**
 * R2 buy-in confirmation from Figma `Group 1707478439` (352:744), centred
 * over `Desktop - 21`'s full-page 5px blur (352:646) while a question is
 * locked. Exact 621×392 geometry from `sm` (title/close offsets are net of
 * the header bar's 1.77px border); stacks below `sm`. Clicking the blur does
 * nothing — only Enter, Go Back, ✕ or Esc act.
 */
export function BuyInConfirm({ onEnter, backHref, isPending }: BuyInConfirmProps) {
  const router = useRouter();
  const onGoBack = () => router.push(backHref);

  return (
    <Dialog.Root
      open
      disablePointerDismissal
      onOpenChange={open => {
        if (!open) onGoBack();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 backdrop-blur-[5px]" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 flex w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-[10px] bg-code-panel pb-6 text-center outline-none sm:left-[calc(50%-311px)] sm:block sm:h-[392px] sm:w-[621px] sm:translate-x-0 sm:pb-0">
          <div className="relative h-[68px] w-full shrink-0 rounded-t-[10px] border-[1.77px] border-scratch-rule bg-black sm:absolute sm:top-0 sm:left-0">
            <Dialog.Title className="absolute top-[19.23px] left-4 font-inria text-[26px] leading-[25.075px] font-bold whitespace-nowrap text-brand-accent sm:left-[95.23px] sm:text-[36px]">
              CONFIRM PURCHASE
            </Dialog.Title>
            <Dialog.Close
              aria-label="Go back"
              className="absolute top-[19.23px] right-[19.23px] size-[26px] cursor-pointer focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <span aria-hidden="true" style={CLOSE_MASK} className="block size-full bg-white" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="mt-4 px-4 font-sans text-[18px] leading-[30px] font-medium text-white sm:absolute sm:top-[84px] sm:left-[131px] sm:mt-0 sm:w-[369px] sm:px-0">
            Once you use your coins to attempt this question, the coins deducted will not be
            refunded. You must complete the question to earn points.
          </Dialog.Description>
          <p className="mt-6 font-sans text-[18px] leading-[30px] font-medium whitespace-nowrap text-white sm:absolute sm:top-[248px] sm:left-[208px] sm:mt-0">
            Do you want to jump in?
          </p>
          <div className="mt-6 flex gap-4 sm:contents">
            <button
              type="button"
              onClick={onEnter}
              disabled={isPending}
              className={cn(
                BUTTON,
                'bg-code-enter text-white sm:absolute sm:top-[304px] sm:left-[111px]'
              )}
            >
              Enter
            </button>
            <button
              type="button"
              onClick={onGoBack}
              className={cn(
                BUTTON,
                'bg-code-sand text-black sm:absolute sm:top-[304px] sm:left-[331px]'
              )}
            >
              Go Back
            </button>
          </div>
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
            className="pointer-events-none absolute top-[-6px] left-[250px] size-[57px] max-w-none sm:top-[-8px] sm:left-[422px] sm:size-[79px]"
          />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
