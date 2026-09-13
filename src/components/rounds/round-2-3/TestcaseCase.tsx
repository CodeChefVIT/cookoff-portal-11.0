import type { TestcaseResult } from '@/api';

import type { Testcase } from '../types';

export interface TestcaseCaseProps {
  testcase: Testcase;
  result?: TestcaseResult;
}

/**
 * One case: Input / Expected Output / Output columns. Hidden cases NEVER
 * render input/expected/actual — only the aggregate count in TestcasePanel
 * does that job. Enforced here too as a defence against a backend leak.
 */
export function TestcaseCase({ testcase, result }: TestcaseCaseProps) {
  if (testcase.hidden) {
    return (
      <p className="text-sm text-muted-foreground">
        Hidden test case — {result?.passed ? 'passed' : 'result withheld until you pass it'}.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground">Input</h4>
        <pre className="mt-1 overflow-x-auto rounded-lg bg-secondary p-2 text-xs break-words whitespace-pre-wrap text-secondary-foreground">
          {testcase.input}
        </pre>
      </div>
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground">Expected Output</h4>
        <pre className="mt-1 overflow-x-auto rounded-lg bg-secondary p-2 text-xs break-words whitespace-pre-wrap text-secondary-foreground">
          {testcase.expectedOutput}
        </pre>
      </div>
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground">Output</h4>
        <pre className="mt-1 overflow-x-auto rounded-lg bg-secondary p-2 text-xs break-words whitespace-pre-wrap text-secondary-foreground">
          {result?.stdout ?? ''}
        </pre>
      </div>
    </div>
  );
}
