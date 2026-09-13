'use client';

import { parseAsInteger, useQueryState } from 'nuqs';

import { isPassed } from '@/api';
import type { SubmissionVerdict } from '@/api';
import { cn } from '@/lib/utils';

import type { Testcase } from '../types';
import { TestcaseCase } from './TestcaseCase';

export interface TestcasePanelProps {
  /** The set fetched from `GET /question/:id/testcases/public` — always visible-only. */
  testcases: Testcase[];
  verdict?: SubmissionVerdict;
  isPolling: boolean;
}

/**
 * Verdict banner + case tabs + hidden aggregate + compiler message, matching
 * Desktop - 15.png. `dto.ResultResponse.testcases` covers every testcase
 * (public and hidden — the submission runs against all of them); any result
 * whose `testcaseId` isn't in our known public set is hidden. Hidden cases
 * expose only pass/fail counts — never their input/expected/actual (tested
 * explicitly).
 */
export function TestcasePanel({ testcases, verdict, isPolling }: TestcasePanelProps) {
  const [activeIndex, setActiveIndex] = useQueryState('case', parseAsInteger.withDefault(0));
  const active = testcases[Math.min(activeIndex, Math.max(testcases.length - 1, 0))];

  const verdictTestcases = verdict?.testcases ?? [];
  const resultById = new Map(verdictTestcases.map(result => [result.testcaseId, result]));
  const visibleIds = new Set(testcases.map(testcase => testcase.id));
  const hiddenResults = verdictTestcases.filter(result => !visibleIds.has(result.testcaseId));
  const hiddenPassed = hiddenResults.filter(isPassed).length;

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
            verdict.failed === 0 && verdict.passed > 0
              ? 'bg-primary/15 text-primary'
              : 'bg-destructive/15 text-destructive'
          )}
        >
          {verdict.passed}/{verdict.passed + verdict.failed} Test Cases Passed !!
        </div>
      )}
      {isPolling && !verdict && (
        <p role="status" className="text-sm text-muted-foreground">
          Judging your submission…
        </p>
      )}

      <div role="tablist" aria-label="Visible test cases" className="flex flex-wrap gap-1">
        {testcases.map((testcase, index) => {
          const result = resultById.get(testcase.id);
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
                  result
                    ? isPassed(result)
                      ? 'bg-primary'
                      : 'bg-destructive'
                    : 'bg-muted-foreground'
                )}
              />
              Case {index + 1}
              {result && <span className="sr-only">{isPassed(result) ? 'passed' : 'failed'}</span>}
            </button>
          );
        })}
        {hiddenResults.length > 0 && (
          <span className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
            <span aria-hidden="true">🙈</span>
            Hidden Testcases {hiddenPassed}/{hiddenResults.length}
          </span>
        )}
      </div>

      {active && <TestcaseCase testcase={active} result={resultById.get(active.id)} />}

      {verdict?.description && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground">Compiler Message</h4>
          <p className="mt-1 text-sm text-muted-foreground">{verdict.description}</p>
        </div>
      )}
    </section>
  );
}
