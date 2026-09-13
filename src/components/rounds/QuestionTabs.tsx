'use client';

import { cn } from '@/lib/utils';

import { useQuestionTabNav } from './hooks';
import type { Question } from './types';

export interface QuestionTabsProps {
  roundId: number;
  questions: Question[];
  activeId?: string;
}

/**
 * Solid dome tabs matching `design/Desktop - 14.svg` through `- 21.svg` —
 * the same half-circle shape and active/inactive size contrast as R1's
 * `ScratchQuestionTabs` (the one question-selector design confirmed correct
 * against Figma), recoloured for the R2/R3 dark/red identity instead of
 * R1's scratch-tab tan. Real ARIA tablist — keyboard-navigable with
 * arrows/Home/End.
 */
export function QuestionTabs({ roundId, questions, activeId }: QuestionTabsProps) {
  const { go, onKeyDown } = useQuestionTabNav(roundId, questions);

  return (
    <div
      role="tablist"
      aria-label="Questions"
      className="flex [scrollbar-width:none] items-end gap-1 overflow-x-auto px-4 pt-3 sm:px-6"
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
              'flex shrink-0 cursor-pointer items-end justify-center gap-0.5 rounded-[50%_50%_3px_3px/100%_100%_3px_3px] pb-1.5 text-sm font-bold text-background transition-colors focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none',
              isActive
                ? 'h-11 w-14 bg-foreground'
                : 'h-9 w-12 bg-muted-foreground/70 hover:bg-muted-foreground'
            )}
          >
            {index + 1}
            {question.solved && (
              <span aria-hidden="true" className="text-xs text-primary">
                ✓
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
