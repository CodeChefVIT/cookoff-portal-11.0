'use client';

import type { CSSProperties } from 'react';
import Image from 'next/image';
import { parseAsInteger, useQueryState } from 'nuqs';

import { isPassed } from '@/api';
import type { SubmissionVerdict } from '@/api';
import { cn } from '@/lib/utils';

import type { Testcase } from '../types';
import { TestcaseCase } from './TestcaseCase';

export interface TestcasePanelProps {
  /** The set fetched from `GET /question/:id/testcases/public` — always visible-only. */
  testcases: Testcase[];
  verdict: SubmissionVerdict;
}

const EYE_OFF_MASK: CSSProperties = {
  maskImage: 'url(/code-round/eye-off.png)',
  WebkitMaskImage: 'url(/code-round/eye-off.png)',
  maskSize: '100% 100%',
  WebkitMaskSize: '100% 100%',
};

/**
 * The verdict view at Figma `Desktop - 14` (312:1216) geometry: count banner,
 * case tabs + hidden aggregate, compiler message, then the active case's
 * columns. `dto.ResultResponse.testcases` covers every testcase (public and
 * hidden); any result whose `testcaseId` isn't in the known public set is
 * hidden. No per-testcase results at all means the code never compiled —
 * `Desktop - 15`'s red state. Hidden cases expose only pass/fail counts —
 * never their input/expected/actual (tested explicitly).
 */
export function TestcasePanel({ testcases, verdict }: TestcasePanelProps) {
  const [activeIndex, setActiveIndex] = useQueryState('case', parseAsInteger.withDefault(0));
  const active = testcases[Math.min(activeIndex, Math.max(testcases.length - 1, 0))];

  const resultById = new Map(verdict.testcases.map(result => [result.testcaseId, result]));
  const visibleIds = new Set(testcases.map(testcase => testcase.id));
  const hiddenResults = verdict.testcases.filter(result => !visibleIds.has(result.testcaseId));
  const hiddenPassed = hiddenResults.filter(isPassed).length;
  const compiledOk = verdict.testcases.length > 0;
  const total = verdict.passed + verdict.failed || testcases.length;

  return (
    <section
      aria-label="Test cases"
      className="h-full overflow-y-auto rounded-[10px] bg-code-panel py-[9px]"
    >
      <div
        role="status"
        aria-live="polite"
        className={cn(
          'mr-[11px] ml-[21px] h-[38px] rounded-[8px] border bg-code-inset pt-[9px] pl-[12px] font-chip text-[16px] leading-[normal] font-bold',
          compiledOk ? 'border-black text-code-gold' : 'border-transparent text-code-fail'
        )}
      >
        {verdict.passed}/{total} Test Cases Passed{compiledOk ? '' : ' !!'}
      </div>

      <div
        role="tablist"
        aria-label="Visible test cases"
        className="mt-[12px] mr-[11px] ml-[21px] flex flex-wrap items-start gap-x-[41px] gap-y-2"
      >
        {testcases.map((testcase, index) => {
          const result = resultById.get(testcase.id);
          const passed = result !== undefined && isPassed(result);
          const isActive = index === activeIndex;
          return (
            <button
              key={testcase.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => void setActiveIndex(index)}
              className={cn(
                'relative h-[34.645px] w-[96.684px] shrink-0 cursor-pointer rounded-[10px] font-sans text-[15px] leading-[normal] font-bold focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
                isActive
                  ? passed
                    ? 'bg-code-passed-bg text-white'
                    : 'bg-code-failed-bg text-white'
                  : 'bg-code-inset text-code-case-ink'
              )}
            >
              <Image
                src={passed ? '/code-round/dot-pass.svg' : '/code-round/dot-fail.svg'}
                alt=""
                width={10}
                height={6}
                unoptimized
                className="absolute top-[14.08px] left-[6px] h-[6.49px] w-[10.28px]"
              />
              <span className="absolute top-[8px] left-[30px] whitespace-nowrap">
                Case {index + 1}
              </span>
              {result && <span className="sr-only">{passed ? 'passed' : 'failed'}</span>}
            </button>
          );
        })}
        {hiddenResults.length > 0 && (
          <div className="relative ml-auto h-[35px] w-[263px] shrink-0 rounded-[10px] bg-code-inset font-sans leading-[normal] font-bold text-code-case-ink">
            <span
              aria-hidden="true"
              style={EYE_OFF_MASK}
              className={cn(
                'absolute top-[7.1px] left-[14.73px] size-[20.43px]',
                compiledOk ? 'bg-code-gold' : 'bg-code-failed-dot'
              )}
            />
            <span className="absolute top-[8.16px] left-[50.13px] text-[15px] whitespace-nowrap">
              Hidden Testcases
            </span>
            <span className="absolute top-[7px] left-[210px] text-[16px]">
              {hiddenPassed}/{hiddenResults.length}
            </span>
          </div>
        )}
      </div>

      <p className="mt-[6px] ml-[21px] font-inria text-[14px] leading-[17px] font-bold text-white">
        Compiler Message
      </p>
      <div className="mt-[8.42px] mr-[20px] ml-[20px] h-[33.585px] rounded-[6px] bg-code-inset pt-[3.63px] pl-[6px]">
        <p
          title={compiledOk ? undefined : verdict.description}
          className={cn(
            'truncate font-sans text-[13px] leading-[25.075px] font-bold',
            compiledOk ? 'text-code-passed-text' : 'text-code-fail'
          )}
        >
          {compiledOk ? 'Compilation Successful !!' : 'Compilation Failed !!'}
        </p>
      </div>

      {active && <TestcaseCase testcase={active} result={resultById.get(active.id)} />}
    </section>
  );
}
