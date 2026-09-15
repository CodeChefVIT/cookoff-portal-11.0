import { cva } from 'class-variance-authority';

import type { Question } from '../rounds/types';

/**
 * SHARED UI - Question Header
 *
 * Two-tone `Problem {n}: {title}` in Space Grotesk Bold with the points chip
 * beneath it. `code` is Figma `Desktop - 15` (312:1101) to the pixel: 36px
 * title, 103×19.5 #484848 chip.
 */
export interface QuestionHeaderProps {
  question: Question;
  /** 1-based position within the round's question list, for the "Problem N:" prefix. */
  index?: number;
  variant?: 'default' | 'code';
}

const containerVariants = cva('flex flex-col items-start', {
  variants: { variant: { default: 'gap-4', code: 'gap-[15.86px]' } },
  defaultVariants: { variant: 'default' },
});

// `code`: Figma sets 36px on a 25.075px line; 40px keeps wrapped titles apart and ProblemPanel re-centres a single line.
const titleVariants = cva('font-problem font-bold', {
  variants: {
    variant: {
      default: 'text-[22px] leading-tight text-brand xl:text-[28px]',
      code: 'text-[36px] leading-[40px] text-code-brand',
    },
  },
  defaultVariants: { variant: 'default' },
});

const chipVariants = cva('rounded-[4px] font-chip text-sm font-bold text-chip-foreground', {
  variants: {
    variant: {
      default: 'bg-chip px-[19px] leading-[19.6px]',
      code: '-ml-px inline-flex h-[19.5px] min-w-[103px] items-center bg-code-chip pr-[20px] pl-[18.4px] leading-[18.807px]',
    },
  },
  defaultVariants: { variant: 'default' },
});

export function QuestionHeader({ question, index, variant }: QuestionHeaderProps) {
  return (
    <div className={containerVariants({ variant })}>
      <h2 className={titleVariants({ variant })}>
        {index !== undefined && `Problem ${index}: `}
        <span className="text-problem-title">{question.title}</span>
      </h2>
      <span className={chipVariants({ variant })}>{question.points} Points</span>
    </div>
  );
}
