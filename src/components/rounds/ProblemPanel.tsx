import type { ReactNode } from 'react';
import { cva } from 'class-variance-authority';

import { QuestionHeader } from '@/components/ui/question-header';
import { cn } from '@/lib/utils';

import type { Question } from './types';

export interface ProblemPanelProps {
  question: Question;
  index?: number;
  /** Panel title above the problem (R1's "Question"); R2/R3 render none. */
  heading?: ReactNode;
  /** `code`: R2/R3's Figma `Desktop - 15/14` panel — fixed title block, scrolling body. */
  variant?: 'default' | 'code';
  className?: string;
}

// Figma `Desktop - 15` problem body: Inter Regular 16px, white, 30px line height.
const BODY_TEXT = 'font-sans text-base leading-[30px] text-white';

const panelVariants = cva('h-full min-h-0 text-card-foreground', {
  variants: {
    variant: {
      default: 'overflow-y-auto rounded-2xl border border-border bg-card p-5',
      code: 'flex flex-col rounded-[10px] bg-code-panel',
    },
  },
  defaultVariants: { variant: 'default' },
});

// 21.54px = Figma's 29px title offset minus half the 40px-vs-25.075px line-height difference.
const headerVariants = cva('', {
  variants: {
    variant: { default: '', code: 'shrink-0 pt-[21.54px] pr-[20px] pl-[33px]' },
  },
  defaultVariants: { variant: 'default' },
});

const bodyVariants = cva('', {
  variants: {
    variant: {
      default: 'mt-4',
      code: 'mt-[16.1px] min-h-0 flex-1 overflow-y-auto pr-[20px] pb-[16px] pl-[36px]',
    },
  },
  defaultVariants: { variant: 'default' },
});

const sampleVariants = cva('mt-1 overflow-x-auto break-words whitespace-pre-wrap', {
  variants: {
    variant: {
      default: 'rounded-lg bg-secondary p-3 text-xs text-secondary-foreground',
      code: BODY_TEXT,
    },
  },
  defaultVariants: { variant: 'default' },
});

/** Left column: full problem statement, independently scrollable. */
export function ProblemPanel({ question, index, heading, variant, className }: ProblemPanelProps) {
  return (
    <section
      aria-labelledby="problem-heading"
      className={cn(panelVariants({ variant }), className)}
    >
      {heading}
      <div id="problem-heading" className={headerVariants({ variant })}>
        <QuestionHeader question={question} index={index} variant={variant} />
      </div>

      <div className={bodyVariants({ variant })}>
        <p className={cn('whitespace-pre-wrap', BODY_TEXT)}>{question.description}</p>

        {question.constraints.length > 0 && (
          <section aria-label="Constraints">
            <h3 className={BODY_TEXT}>Constraints</h3>
            <ul className={cn('list-disc pl-6', BODY_TEXT)}>
              {question.constraints.map((constraint, i) => (
                <li key={i}>{constraint}</li>
              ))}
            </ul>
          </section>
        )}

        {question.inputFormat.length > 0 && (
          <section aria-label="Input format">
            <h3 className={BODY_TEXT}>Input Format</h3>
            <ol className={cn('list-decimal pl-6', BODY_TEXT)}>
              {question.inputFormat.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ol>
          </section>
        )}

        {question.outputFormat.length > 0 && (
          <section aria-label="Output format">
            <h3 className={BODY_TEXT}>Output Format</h3>
            <ol className={cn('list-decimal pl-6', BODY_TEXT)}>
              {question.outputFormat.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ol>
          </section>
        )}

        {question.sampleTestInput.length > 0 && (
          <section aria-label="Sample">
            <h3 className={BODY_TEXT}>Sample</h3>
            <pre className={sampleVariants({ variant })}>{question.sampleTestInput.join('\n')}</pre>
            <pre className={sampleVariants({ variant })}>
              {question.sampleTestOutput.join('\n')}
            </pre>
          </section>
        )}

        {question.explanation.length > 0 && (
          <section aria-label="Explanation">
            <h3 className={BODY_TEXT}>Explanation</h3>
            <p className={BODY_TEXT}>{question.explanation.join(' ')}</p>
          </section>
        )}
      </div>
    </section>
  );
}
