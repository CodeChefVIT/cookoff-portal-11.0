'use client';

import type { CSSProperties } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { Check, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { Question } from '@/types';

export interface VerdictBoxProps {
  open: boolean;
  onClose: () => void;
  /** Drives the whole box: title, icon, colour, message and button label. */
  correct: boolean;
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
 * Every round's submission verdict, in the language of the R2 buy-in box
 * (`BuyInConfirm`, Figma 352:744) — there is no Figma frame for it: same
 * 621×392 panel, black header bar, ✕ and 5px page blur, with one big glyph and
 * a single button in the Enter style. A wrong answer gets the same treatment as
 * a right one rather than an easily-missed banner under the workspace. Never
 * shows payout copy for `alreadyAnswered` (payout fires once, LLD §2.6); coins
 * only with `showReward`.
 */
export function VerdictBox({
  open,
  onClose,
  correct,
  question,
  pointsAwarded,
  alreadyAnswered,
  showReward,
}: VerdictBoxProps) {
  const reward = Number(question.reward);
  const solvedMessage = alreadyAnswered
    ? 'You already solved this one, so there is no extra payout this time.'
    : `You earned ${pointsAwarded} points${showReward && reward > 0 ? ` and ${reward} coins` : ''}.`;
  const message = correct
    ? solvedMessage
    : 'Not quite. Try putting the blocks in a different order.';

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
            <Dialog.Title
              className={cn(
                'absolute inset-x-0 top-[19.23px] font-inria text-[26px] leading-[25.075px] font-bold whitespace-nowrap sm:text-[36px]',
                correct ? 'text-brand-accent' : 'text-code-fail'
              )}
            >
              {correct ? 'CORRECT ANSWER' : 'WRONG ANSWER'}
            </Dialog.Title>
            <Dialog.Close
              aria-label="Close"
              className="absolute top-[19.23px] right-[19.23px] size-[26px] cursor-pointer focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <span aria-hidden="true" style={CLOSE_MASK} className="block size-full bg-white" />
            </Dialog.Close>
          </div>
          {correct ? (
            <Check
              aria-hidden="true"
              strokeWidth={3}
              className="mt-4 size-[90px] text-code-passed-text sm:absolute sm:top-[84px] sm:left-[255.5px] sm:mt-0 sm:size-[110px]"
            />
          ) : (
            <X
              aria-hidden="true"
              strokeWidth={3}
              className="mt-4 size-[90px] text-code-fail sm:absolute sm:top-[84px] sm:left-[255.5px] sm:mt-0 sm:size-[110px]"
            />
          )}
          <Dialog.Description className="mt-2 px-4 font-sans text-[18px] leading-[30px] font-medium text-white sm:absolute sm:top-[214px] sm:left-[126px] sm:mt-0 sm:w-[369px] sm:px-0">
            {message}
          </Dialog.Description>
          <Dialog.Close
            className={cn(
              'mt-6 h-12 w-[140px] cursor-pointer rounded-[10px] bg-code-enter font-sans text-[20px] leading-[25.075px] font-semibold text-white shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
              'sm:absolute sm:top-[304px] sm:left-[220.5px] sm:mt-0 sm:w-[180px]'
            )}
          >
            {correct ? 'Continue' : 'Try Again'}
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
