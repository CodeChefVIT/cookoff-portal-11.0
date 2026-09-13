import type { Question } from '../rounds/types';

/**
 * SHARED UI - Question Header
 *
 * Two-tone `Problem {n}: {title}` in Space Grotesk Bold with the points chip
 * beneath it, matching Figma `Desktop - 15` (312:1101).
 */
export interface QuestionHeaderProps {
  question: Question;
  /** 1-based position within the round's question list, for the "Problem N:" prefix. */
  index?: number;
}

export function QuestionHeader({ question, index }: QuestionHeaderProps) {
  return (
    <div className="flex flex-col items-start gap-4">
      <h2 className="font-problem text-[22px] leading-tight font-bold text-brand xl:text-[28px]">
        {index !== undefined && `Problem ${index}: `}
        <span className="text-problem-title">{question.title}</span>
      </h2>
      <div className="flex shrink-0 items-center gap-2">
        {question.bountyActive && (
          <span className="rounded-full bg-coin/20 px-2.5 py-1 text-xs font-medium text-coin">
            <span aria-hidden="true">🎯</span> Bounty
          </span>
        )}
        <span className="rounded-[4px] bg-chip px-[19px] font-chip text-sm leading-[19.6px] font-bold text-chip-foreground">
          {question.points} Points
        </span>
      </div>
    </div>
  );
}
