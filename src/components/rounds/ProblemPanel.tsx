import type { ReactNode, SyntheticEvent } from 'react';
import { cva } from 'class-variance-authority';
import ReactMarkdown, { type Components } from 'react-markdown';

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

function stripLeadingListMarker(text: string) {
  return text.replace(/^(?:[-*•]|\d+\.)\s+/, '').trim();
}

const markdownComponents: Components = {
  h1: ({ children }) => <h1 className="my-3 text-2xl font-bold text-brand">{children}</h1>,
  h2: ({ children }) => <h2 className="my-2 text-xl font-bold text-brand">{children}</h2>,
  h3: ({ children }) => <h3 className="my-2 text-lg font-bold text-brand">{children}</h3>,
  h4: ({ children }) => <h4 className="my-1 text-base font-bold text-brand">{children}</h4>,
  p: ({ children }) => <p className="mb-2 leading-[30px]">{children}</p>,
  ul: ({ children }) => <ul className="my-2 list-disc pl-6">{children}</ul>,
  ol: ({ children }) => <ol className="my-2 list-decimal pl-6">{children}</ol>,
  li: ({ children }) => <li className="my-1">{children}</li>,
  code: ({ className, children, ...props }) => (
    <code
      className={cn(
        'rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-[#f14a16]',
        className
      )}
      {...props}
    >
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="my-2 overflow-x-auto rounded-[8px] border border-white/10 bg-code-inset p-3 font-mono text-sm leading-6 whitespace-pre text-white">
      {children}
    </pre>
  ),
  strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
  em: ({ children }) => <em className="text-white/90 italic">{children}</em>,
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-4 border-brand pl-4 text-white/80 italic">
      {children}
    </blockquote>
  ),
};

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
  const showSamples = question.round !== 1 && samples.length > 0;

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
        <div className={cn(BODY_TEXT)}>
          <ReactMarkdown components={markdownComponents}>{question.description}</ReactMarkdown>
        </div>

        {question.inputFormat.length > 0 && (
          <section aria-label="Input format" className={SECTION}>
            <h3 className={sectionTitleVariants({ variant })}>Input Format</h3>
            <div className={cn(BODY_TEXT)}>
              {question.inputFormat.map((line, i) => (
                <ReactMarkdown key={i} components={markdownComponents}>
                  {line}
                </ReactMarkdown>
              ))}
            </div>
          </section>
        )}

        {question.outputFormat.length > 0 && (
          <section aria-label="Output format" className={SECTION}>
            <h3 className={sectionTitleVariants({ variant })}>Output Format</h3>
            <div className={cn(BODY_TEXT)}>
              {question.outputFormat.map((line, i) => (
                <ReactMarkdown key={i} components={markdownComponents}>
                  {line}
                </ReactMarkdown>
              ))}
            </div>
          </section>
        )}

        {showSamples && (
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
                      <div className={cn('mt-1', BODY_TEXT)}>
                        <ReactMarkdown components={markdownComponents}>
                          {sample.explanation}
                        </ReactMarkdown>
                      </div>
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
            <div className={cn('pl-0', BODY_TEXT)}>
              {question.constraints.map((constraint, i) => (
                <div key={i} className="my-1">
                  <ReactMarkdown
                    components={{
                      ...markdownComponents,
                      p: ({ children }) => <span className="inline">{children}</span>,
                    }}
                  >
                    {stripLeadingListMarker(constraint)}
                  </ReactMarkdown>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </section>
  );
}
