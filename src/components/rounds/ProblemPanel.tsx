import type { ReactNode } from 'react';

import { QuestionHeader } from '@/components/ui/question-header';
import { cn } from '@/lib/utils';

import type { Question } from './types';

export interface ProblemPanelProps {
  question: Question;
  index?: number;
  /** Panel title above the problem (R1's "Question"); R2/R3 render none. */
  heading?: ReactNode;
  className?: string;
}

// Figma `Desktop - 15` problem body: Inter Regular 16px, white, 30px line height.
const BODY_TEXT = 'font-sans text-base leading-[30px] text-white';

/** Left column of Desktop - 15.png: full problem statement, independently scrollable. */
export function ProblemPanel({ question, index, heading, className }: ProblemPanelProps) {
  return (
    <section
      aria-labelledby="problem-heading"
      className={cn(
        'h-full min-h-0 overflow-y-auto rounded-2xl border border-border bg-card p-5 text-card-foreground',
        className
      )}
    >
      {heading}
      <div id="problem-heading">
        <QuestionHeader question={question} index={index} />
      </div>
      <p className={cn('mt-4 whitespace-pre-wrap', BODY_TEXT)}>{question.description}</p>

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
          <pre className="mt-1 overflow-x-auto rounded-lg bg-secondary p-3 text-xs break-words whitespace-pre-wrap text-secondary-foreground">
            {question.sampleTestInput.join('\n')}
          </pre>
          <pre className="mt-1 overflow-x-auto rounded-lg bg-secondary p-3 text-xs break-words whitespace-pre-wrap text-secondary-foreground">
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
    </section>
  );
}
