import Image from 'next/image';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

import type { Question } from '../rounds/types';

/**
 * SHARED UI - Question Header
 *
 * Two-tone `Problem {n}: {title}` in Space Grotesk Bold with the points chip
 * beneath it. `code` is Figma `Desktop - 15` (312:1101) to the pixel: 36px
 * title, 103×19.5 #484848 chip. `reward` adds a matching coin chip beside it (R2).
 */
export interface QuestionHeaderProps {
  question: Question;
  /** 1-based position within the round's question list, for the "Problem N:" prefix. */
  index?: number;
  variant?: 'default' | 'code';
  /** Coins paid out on solving the question; renders a coin chip when set. */
  reward?: number;
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

export function QuestionHeader({ question, index, variant, reward }: QuestionHeaderProps) {
  return (
    <div className={containerVariants({ variant })}>
      <h2 className={titleVariants({ variant })}>
        {index !== undefined && `Problem ${index}: `}
        <span className="text-problem-title">{question.title}</span>
      </h2>
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn('shrink-0', chipVariants({ variant }))}>{question.points} Points</span>
        {reward !== undefined && (
          <span className={cn('shrink-0 gap-1', chipVariants({ variant }), 'inline-flex')}>
            <Image
              src="/code-round/coin.svg"
              alt=""
              width={22}
              height={22}
              unoptimized
              className="-my-1 -ml-1 size-[22px] max-w-none"
            />
            Reward: {reward} Coins
          </span>
        )}
      </div>
    </div>
  );
}
