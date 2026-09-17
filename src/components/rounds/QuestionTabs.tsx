'use client';

import Image from 'next/image';

import { cn } from '@/lib/utils';

import { useQuestionTabNav } from './hooks';
import type { Question } from './types';

export interface QuestionTabsProps {
  roundId: number;
  questions: Question[];
  activeId?: string;
  className?: string;
}

/**
 * Half-ellipse question tabs from Figma `Desktop - 15/14` (312:1101,
 * 312:1216): active 94.79×44, others 76.77×37 at 75%, Quicksand Bold 21px
 * numerals, 12px apart (the frame's 7 tabs span exactly 32→661px). Real ARIA
 * tablist — keyboard-navigable with arrows/Home/End.
 */
export function QuestionTabs({ roundId, questions, activeId, className }: QuestionTabsProps) {
  const { go, onKeyDown } = useQuestionTabNav(roundId, questions);

  return (
    <div
      role="tablist"
      aria-label="Questions"
      className={cn('flex [scrollbar-width:none] items-end gap-[12px] overflow-x-auto', className)}
    >
      {questions.map((question, index) => {
        const isActive = question.id === activeId;
        return (
          <div
            key={question.id}
            role="tab"
            tabIndex={isActive ? 0 : -1}
            aria-selected={isActive}
            aria-label={`Problem ${index + 1}${question.solved ? ', solved' : ''}`}
            onClick={() => go(index)}
            onKeyDown={event => onKeyDown(event, index)}
            className={cn(
              'relative flex shrink-0 cursor-pointer justify-center font-tab text-[21px] leading-[30px] font-bold text-black focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
              isActive ? 'h-[44px] w-[94.79px] pt-[7.42px]' : 'h-[37px] w-[76.77px] pt-[3.74px]'
            )}
          >
            <Image
              src={isActive ? '/code-round/tab-active.svg' : '/code-round/tab-inactive.svg'}
              alt=""
              fill
              unoptimized
              className="pointer-events-none"
            />
            <span className="relative">{index + 1}</span>
          </div>
        );
      })}
    </div>
  );
}
