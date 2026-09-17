'use client';

import { cn } from '@/lib/utils';

import { useQuestionTabNav } from '../hooks';
import type { Question } from '../types';

export interface ScratchQuestionTabsProps {
  roundId: number;
  questions: Question[];
  activeId?: string;
}

/**
 * Half-circle question tabs from Figma `scratch`: active 87×39, others 71×32.5
 * at 75%. A solved question's tab turns green.
 */
export function ScratchQuestionTabs({ roundId, questions, activeId }: ScratchQuestionTabsProps) {
  const { go, onKeyDown } = useQuestionTabNav(roundId, questions);

  return (
    <div
      role="tablist"
      aria-label="Questions"
      className="flex [scrollbar-width:none] items-end gap-[5px] overflow-x-auto px-4 pt-4 pb-[4px] lg:pt-[10px] lg:pl-[31px]"
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
            data-solved={question.solved ? 'true' : undefined}
            onClick={() => go(index)}
            onKeyDown={event => onKeyDown(event, index)}
            className={cn(
              'flex shrink-0 cursor-pointer items-end justify-center rounded-[50%_50%_3px_3px/100%_100%_3px_3px] font-tab text-[21px] leading-[30px] font-bold text-black transition-colors focus-visible:ring-3 focus-visible:ring-scratch-border/60 focus-visible:outline-none',
              isActive ? 'h-[39px] w-[87px] pb-[2px]' : 'h-[32.5px] w-[71px]',
              question.solved
                ? isActive
                  ? 'bg-code-passed-text'
                  : 'bg-code-passed-text/75 hover:bg-code-passed-text/90'
                : isActive
                  ? 'bg-scratch-tab'
                  : 'bg-scratch-tab/75 hover:bg-scratch-tab/90'
            )}
          >
            {index + 1}
          </div>
        );
      })}
    </div>
  );
}
