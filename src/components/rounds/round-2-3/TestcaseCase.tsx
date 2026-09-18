import type { TestcaseResult } from '@/api';
import { isPassed } from '@/api';

import type { Testcase } from '../types';

export interface TestcaseCaseProps {
  testcase: Testcase;
  result?: TestcaseResult;
}

/**
 * One case: Input / Expected Output / Output columns at Figma `Desktop - 14`
 * geometry (207×157.48 #16191d boxes under Inria Sans captions). Hidden cases
 * NEVER render input/expected/actual — only the aggregate count in
 * TestcasePanel does that job. `dto.TestcaseResult` has no `stdout` field —
 * the Output column shows the verdict status instead of actual program
 * output, which the backend doesn't return per-case.
 */
export function TestcaseCase({ testcase, result }: TestcaseCaseProps) {
  if (testcase.hidden) {
    return (
      <p className="mr-[20px] ml-[21px] font-sans text-sm text-code-case-ink">
        Hidden test case:{' '}
        {result && isPassed(result) ? 'passed' : 'result withheld until you pass it'}.
      </p>
    );
  }

  const output = result
    ? result.description && result.description !== result.status
      ? `${result.status}: ${result.description}`
      : result.status
    : '';

  const columns = [
    ['Input', testcase.input],
    ['Expected Output', testcase.expectedOutput],
    ['Output', output],
  ] as const;

  return (
    <div className="mr-[20px] ml-[21px] grid grid-cols-1 gap-x-[23.5px] sm:grid-cols-3">
      {columns.map(([label, value]) => (
        <div key={label} className="min-w-0">
          <h4 className="pl-[5px] font-inria text-[13px] leading-[25.075px] font-bold text-white">
            {label}
          </h4>
          <pre className="mt-[4.35px] h-[157.477px] overflow-auto rounded-[10px] bg-code-inset pt-[11.04px] pr-[12px] pl-[21px] font-sans text-[14px] leading-[25.075px] font-bold break-words whitespace-pre-wrap text-white">
            {value}
          </pre>
        </div>
      ))}
    </div>
  );
}
