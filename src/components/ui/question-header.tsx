import type { Question } from '../rounds/types';

/**
 * SHARED UI - Question Header
 *
 * `Problem {n}: {title}` + points chip, matching `src/figma/Desktop - 15.png`.
 */
export interface QuestionHeaderProps {
  question: Question;
  /** 1-based position within the round's question list, for the "Problem N:" prefix. */
  index?: number;
}

export function QuestionHeader({ question, index }: QuestionHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="font-display text-xl text-brand sm:text-2xl">
        {index !== undefined ? `Problem ${index}: ` : ''}
        {question.title}
      </h2>
      <span className="shrink-0 rounded-full bg-chip px-2.5 py-1 text-xs font-medium text-foreground">
        {question.points} Points
      </span>
    </div>
  );
}
