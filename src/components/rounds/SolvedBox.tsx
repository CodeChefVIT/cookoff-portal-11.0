'use client';

import type { CSSProperties } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

import type { Question } from './types';

export interface SolvedBoxProps {
  open: boolean;
  onClose: () => void;
  question: Question;
  pointsAwarded: number;
  alreadyAnswered: boolean;
  /** Only Round 2 pays coins (`RoundConfig.hasCurrency`). */
  showReward: boolean;
}

const CLOSE_MASK: CSSProperties = {
  maskImage: 'url(/code-round/close.png)',
  WebkitMaskImage: 'url(/code-round/close.png)',
  maskSize: '100% 100%',
  WebkitMaskSize: '100% 100%',
};

/**
 * Every round's solve celebration, in the language of the R2 buy-in box
 * (`BuyInConfirm`, Figma 352:744) — there is no Figma frame for it: same
 * 621×392 panel, black header bar, ✕ and 5px page blur, with a big green tick
 * and a single Continue in the Enter style. Never shows payout copy for
 * `alreadyAnswered` (payout fires once, LLD §2.6); coins only with
 * `showReward`.
 */
export function SolvedBox({
  open,
  onClose,
  question,
  pointsAwarded,
  alreadyAnswered,
  showReward,
}: SolvedBoxProps) {
  const reward = Number(question.reward);
  const message = alreadyAnswered
    ? 'Already solved — no additional payout for this resubmission.'
    : `You earned ${pointsAwarded} points${showReward && reward > 0 ? ` and ${reward} coins` : ''}.`;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={next => {
        if (!next) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 backdrop-blur-[5px]" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 flex w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-[10px] bg-code-panel pb-6 text-center outline-none sm:left-[calc(50%-311px)] sm:block sm:h-[392px] sm:w-[621px] sm:translate-x-0 sm:pb-0">
          <div className="relative h-[68px] w-full shrink-0 rounded-t-[10px] border-[1.77px] border-scratch-rule bg-black sm:absolute sm:top-0 sm:left-0">
            <Dialog.Title className="absolute inset-x-0 top-[19.23px] font-inria text-[26px] leading-[25.075px] font-bold whitespace-nowrap text-brand-accent sm:text-[36px]">
              CORRECT ANSWER
            </Dialog.Title>
            <Dialog.Close
              aria-label="Close"
              className="absolute top-[19.23px] right-[19.23px] size-[26px] cursor-pointer focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <span aria-hidden="true" style={CLOSE_MASK} className="block size-full bg-white" />
            </Dialog.Close>
          </div>
          <Check
            aria-hidden="true"
            strokeWidth={3}
            className="mt-4 size-[90px] text-code-passed-text sm:absolute sm:top-[84px] sm:left-[255.5px] sm:mt-0 sm:size-[110px]"
          />
          <Dialog.Description className="mt-2 px-4 font-sans text-[18px] leading-[30px] font-medium text-white sm:absolute sm:top-[214px] sm:left-[126px] sm:mt-0 sm:w-[369px] sm:px-0">
            {message}
          </Dialog.Description>
          <Dialog.Close
            className={cn(
              'mt-6 h-12 w-[140px] cursor-pointer rounded-[10px] bg-code-enter font-sans text-[20px] leading-[25.075px] font-semibold text-white shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
              'sm:absolute sm:top-[304px] sm:left-[220.5px] sm:mt-0 sm:w-[180px]'
            )}
          >
            Continue
          </Dialog.Close>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[10px] border-[1.77px] border-scratch-rule"
          />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
