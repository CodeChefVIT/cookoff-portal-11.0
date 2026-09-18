import type { ReactNode, SyntheticEvent } from 'react';
import { cva } from 'class-variance-authority';

import { QuestionHeader } from '@/components/ui/question-header';
import { cn } from '@/lib/utils';
import type { Question } from '@/types';

export interface ProblemPanelProps {
  question: Question;
  /** Panel title above the problem (R1's "Question"); R2/R3 render none. */
  heading?: ReactNode;
  /** `code`: R2/R3's Figma `Desktop - 15/14` panel — title and body scroll together. */
  variant?: 'default' | 'code';
  /** Shows the question's coin reward beside its points (R2). */
  showReward?: boolean;
  className?: string;
}

// Figma `Desktop - 15` problem body: Inter Regular 16px, white, 30px line height.
const BODY_TEXT = 'font-sans text-base leading-[30px] text-white';

const panelVariants = cva('h-full min-h-0 text-card-foreground', {
  variants: {
    variant: {
      default: 'overflow-y-auto rounded-2xl border border-border bg-card p-5',
      code: 'overflow-y-auto rounded-[10px] bg-code-panel',
    },
  },
  defaultVariants: { variant: 'default' },
});

// 21.54px = Figma's 29px title offset minus half the 40px-vs-25.075px line-height difference.
const headerVariants = cva('', {
  variants: {
    variant: { default: '', code: 'pt-[21.54px] pr-[20px] pl-[33px]' },
  },
  defaultVariants: { variant: 'default' },
});

const bodyVariants = cva('', {
  variants: {
    variant: {
      default: 'mt-4',
      code: 'mt-[16.1px] pr-[20px] pb-[16px] pl-[36px]',
    },
  },
  defaultVariants: { variant: 'default' },
});

// Section titles (Constraints, Input Format, …) in the problem title's face and colour, a step down in size.
const sectionTitleVariants = cva('font-problem font-bold', {
  variants: {
    variant: {
      default: 'text-lg leading-[30px] text-brand',
      code: 'text-[22px] leading-[30px] text-code-brand',
    },
  },
  defaultVariants: { variant: 'default' },
});

const SECTION = 'mt-5';

// One labelled box per sample input/output, in the code panel's inset tone.
const sampleBoxVariants = cva(
  'mt-1 overflow-x-auto rounded-[8px] p-3 font-mono text-sm leading-6 whitespace-pre',
  {
    variants: {
      variant: {
        default: 'bg-secondary text-secondary-foreground',
        code: 'border border-white/10 bg-code-inset text-white',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

const sampleLabelVariants = cva('text-xs font-bold tracking-wide uppercase', {
  variants: {
    variant: { default: 'text-muted-foreground', code: 'text-code-case-ink' },
  },
  defaultVariants: { variant: 'default' },
});

function blockClipboard(event: SyntheticEvent) {
  event.preventDefault();
}

/** Left column: full problem statement, independently scrollable. */
export function ProblemPanel({
  question,
  heading,
  variant,
  showReward,
  className,
}: ProblemPanelProps) {
  // Admin authors samples as parallel lists: `sample_test_input[i]`, `sample_test_output[i]` and `explanation[i]` are sample i.
  const samples = Array.from(
    {
      length: Math.max(
        question.sampleTestInput.length,
        question.sampleTestOutput.length,
        question.explanation.length
      ),
    },
    (_, i) => ({
      input: question.sampleTestInput[i] ?? '',
      output: question.sampleTestOutput[i] ?? '',
      explanation: question.explanation[i] ?? '',
    })
  );

  return (
    // Deters copying the statement out (e.g. into an AI tool): text can't be
    // selected, and copy/cut/drag/context-menu are cancelled. A determined
    // user can still use devtools or a screenshot — this only raises the bar.
    <section
      aria-labelledby="problem-heading"
      className={cn(panelVariants({ variant }), 'select-none', className)}
      onCopy={blockClipboard}
      onCut={blockClipboard}
      onDragStart={blockClipboard}
      onContextMenu={blockClipboard}
    >
      {heading}
      <div id="problem-heading" className={headerVariants({ variant })}>
        <QuestionHeader
          question={question}
          variant={variant}
          reward={showReward ? Number(question.reward) : undefined}
        />
      </div>

      <div className={bodyVariants({ variant })}>
        <p className={cn('whitespace-pre-wrap', BODY_TEXT)}>{question.description}</p>

        {question.inputFormat.length > 0 && (
          <section aria-label="Input format" className={SECTION}>
            <h3 className={sectionTitleVariants({ variant })}>Input Format</h3>
            <ol className={cn('list-decimal pl-6', BODY_TEXT)}>
              {question.inputFormat.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ol>
          </section>
        )}

        {question.outputFormat.length > 0 && (
          <section aria-label="Output format" className={SECTION}>
            <h3 className={sectionTitleVariants({ variant })}>Output Format</h3>
            <ol className={cn('list-decimal pl-6', BODY_TEXT)}>
              {question.outputFormat.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ol>
          </section>
        )}

        {samples.length > 0 && (
          <section aria-label="Samples" className={SECTION}>
            <h3 className={sectionTitleVariants({ variant })}>
              {samples.length === 1 ? 'Sample' : 'Samples'}
            </h3>
            <div className="mt-2 flex flex-col gap-4">
              {samples.map((sample, i) => (
                <div key={i} className="flex flex-col gap-2">
                  {samples.length > 1 && (
                    <p className={cn(BODY_TEXT, 'font-semibold')}>Sample {i + 1}</p>
                  )}
                  <div>
                    <p className={sampleLabelVariants({ variant })}>Input</p>
                    <pre className={sampleBoxVariants({ variant })}>{sample.input}</pre>
                  </div>
                  <div>
                    <p className={sampleLabelVariants({ variant })}>Output</p>
                    <pre className={sampleBoxVariants({ variant })}>{sample.output}</pre>
                  </div>
                  {sample.explanation.trim() && (
                    <div>
                      <p className={sampleLabelVariants({ variant })}>Explanation</p>
                      <p className={cn('mt-1 whitespace-pre-wrap', BODY_TEXT)}>
                        {sample.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {question.constraints.length > 0 && (
          <section aria-label="Constraints" className={SECTION}>
            <h3 className={sectionTitleVariants({ variant })}>Constraints</h3>
            <ul className={cn('list-disc pl-6', BODY_TEXT)}>
              {question.constraints.map((constraint, i) => (
                <li key={i}>{constraint}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </section>
  );
}
