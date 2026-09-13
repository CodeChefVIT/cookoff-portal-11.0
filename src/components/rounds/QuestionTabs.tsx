'use client';

import type { KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';

import type { Question } from './types';

export interface QuestionTabsProps {
  roundId: number;
  questions: Question[];
  activeId?: string;
}

/** Numbered arch tabs (Desktop - 15.png). Real ARIA tablist — keyboard-navigable with arrows/Home/End. */
export function QuestionTabs({ roundId, questions, activeId }: QuestionTabsProps) {
  const router = useRouter();

  function go(index: number) {
    const question = questions[index];
    if (question) router.push(`/round/${roundId}/${question.id}`);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>, index: number) {
    if (event.key === 'ArrowRight') go((index + 1) % questions.length);
    else if (event.key === 'ArrowLeft') go((index - 1 + questions.length) % questions.length);
    else if (event.key === 'Home') go(0);
    else if (event.key === 'End') go(questions.length - 1);
  }

  return (
    <div
      role="tablist"
      aria-label="Questions"
      className="flex [scrollbar-width:none] gap-1 overflow-x-auto px-4 pt-3 sm:px-6"
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
              'flex shrink-0 cursor-pointer items-center gap-1 rounded-t-full border border-b-0 border-hairline/50 px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none',
              isActive
                ? 'bg-card text-card-foreground'
                : 'bg-transparent text-muted-foreground hover:text-foreground'
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
