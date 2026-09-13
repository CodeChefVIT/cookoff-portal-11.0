import { QuestionHeader } from '@/components/ui/question-header';

import type { Question } from './types';

export interface ProblemPanelProps {
  question: Question;
  index?: number;
}

/** Left column of Desktop - 15.png: full problem statement, independently scrollable. */
export function ProblemPanel({ question, index }: ProblemPanelProps) {
  return (
    <section
      aria-labelledby="problem-heading"
      className="h-full min-h-0 overflow-y-auto rounded-2xl border border-border bg-card p-5 text-card-foreground"
    >
      <div id="problem-heading">
        <QuestionHeader question={question} index={index} />
      </div>
      <p className="mt-4 leading-relaxed whitespace-pre-wrap text-muted-foreground">
        {question.description}
      </p>

      {question.constraints.length > 0 && (
        <section className="mt-4" aria-label="Constraints">
          <h3 className="text-sm font-semibold text-foreground">Constraints</h3>
          <ul className="mt-1 list-inside list-disc text-sm text-muted-foreground">
            {question.constraints.map((constraint, i) => (
              <li key={i}>{constraint}</li>
            ))}
          </ul>
        </section>
      )}

      {question.inputFormat.length > 0 && (
        <section className="mt-4" aria-label="Input format">
          <h3 className="text-sm font-semibold text-foreground">Input Format</h3>
          <ol className="mt-1 list-inside list-decimal text-sm text-muted-foreground">
            {question.inputFormat.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ol>
        </section>
      )}

      {question.outputFormat.length > 0 && (
        <section className="mt-4" aria-label="Output format">
          <h3 className="text-sm font-semibold text-foreground">Output Format</h3>
          <ol className="mt-1 list-inside list-decimal text-sm text-muted-foreground">
            {question.outputFormat.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ol>
        </section>
      )}

      {question.sampleTestInput.length > 0 && (
        <section className="mt-4" aria-label="Sample">
          <h3 className="text-sm font-semibold text-foreground">Sample</h3>
          <pre className="mt-1 overflow-x-auto rounded-lg bg-secondary p-3 text-xs break-words whitespace-pre-wrap text-secondary-foreground">
            {question.sampleTestInput.join('\n')}
          </pre>
          <pre className="mt-1 overflow-x-auto rounded-lg bg-secondary p-3 text-xs break-words whitespace-pre-wrap text-secondary-foreground">
            {question.sampleTestOutput.join('\n')}
          </pre>
        </section>
      )}

      {question.explanation.length > 0 && (
        <section className="mt-4" aria-label="Explanation">
          <h3 className="text-sm font-semibold text-foreground">Explanation</h3>
          <p className="mt-1 text-sm text-muted-foreground">{question.explanation.join(' ')}</p>
        </section>
      )}
    </section>
  );
}
