'use client';

import { parseAsInteger, useQueryState } from 'nuqs';

import type { SubmissionVerdict } from '@/api';
import { cn } from '@/lib/utils';

import type { Testcase } from '../types';
import { TestcaseCase } from './TestcaseCase';

export interface TestcasePanelProps {
  testcases: Testcase[];
  verdict?: SubmissionVerdict;
  isPolling: boolean;
}

/**
 * Verdict banner + case tabs + hidden aggregate + compiler message, matching
 * Desktop - 15.png. Hidden cases expose only pass/fail counts — never their
 * input/expected/actual (contest-integrity requirement, tested explicitly).
 */
export function TestcasePanel({ testcases, verdict, isPolling }: TestcasePanelProps) {
  const visible = testcases.filter(testcase => !testcase.hidden);
  const hidden = testcases.filter(testcase => testcase.hidden);
  const [activeIndex, setActiveIndex] = useQueryState('case', parseAsInteger.withDefault(0));
  const active = visible[Math.min(activeIndex, Math.max(visible.length - 1, 0))];

  const hiddenPassed =
    verdict?.results.filter(result => result.hidden && result.passed).length ?? 0;

  return (
    <section
      aria-label="Test cases"
      className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto p-3"
    >
      {verdict && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            'rounded-lg px-3 py-2 text-sm font-medium',
            verdict.testcasesFailed === 0 && verdict.testcasesPassed > 0
              ? 'bg-primary/15 text-primary'
              : 'bg-destructive/15 text-destructive'
          )}
        >
          {verdict.testcasesPassed}/{verdict.testcasesPassed + verdict.testcasesFailed} Test Cases
          Passed !!
        </div>
      )}
      {isPolling && !verdict && (
        <p role="status" className="text-sm text-muted-foreground">
          Judging your submission…
        </p>
      )}

      <div role="tablist" aria-label="Visible test cases" className="flex flex-wrap gap-1">
        {visible.map((testcase, index) => {
          const result = verdict?.results[index];
          const isActive = index === activeIndex;
          return (
            <button
              key={testcase.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => void setActiveIndex(index)}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
                isActive ? 'border-primary bg-primary/10' : 'border-border text-muted-foreground'
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'size-1.5 rounded-full',
                  result ? (result.passed ? 'bg-primary' : 'bg-destructive') : 'bg-muted-foreground'
                )}
              />
              Case {index + 1}
              {result && <span className="sr-only">{result.passed ? 'passed' : 'failed'}</span>}
            </button>
          );
        })}
        {hidden.length > 0 && (
          <span className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
            <span aria-hidden="true">🙈</span>
            Hidden Testcases {hiddenPassed}/{hidden.length}
          </span>
        )}
      </div>

      {active && <TestcaseCase testcase={active} result={verdict?.results[activeIndex]} />}

      {verdict?.compileOutput && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground">Compiler Message</h4>
          <p className="mt-1 text-sm text-destructive">{verdict.compileOutput}</p>
        </div>
      )}
    </section>
  );
}
