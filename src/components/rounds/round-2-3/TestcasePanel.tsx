'use client';

import type { CSSProperties } from 'react';
import { parseAsInteger, useQueryState } from 'nuqs';

import { isPassed } from '@/api';
import type { SubmissionVerdict } from '@/api';
import { cn } from '@/lib/utils';
import type { Testcase } from '@/types';

import { TestcaseCase } from './TestcaseCase';

export interface TestcasePanelProps {
  /** The set fetched from `GET /question/:id/testcases/public` — always visible-only. */
  testcases: Testcase[];
  verdict: SubmissionVerdict;
  /** The public set failed to load, so an empty list means "unknown", not "none". */
  testcasesUnavailable?: boolean;
  onRetryTestcases?: () => void;
}

const COMPILATION_ERROR = 'Compilation Error';

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
export function TestcasePanel({
  testcases,
  verdict,
  testcasesUnavailable = false,
  onRetryTestcases,
}: TestcasePanelProps) {
  const [rawIndex, setActiveIndex] = useQueryState('case', parseAsInteger.withDefault(0));
  // `?case` comes straight from the URL, so clamp it once and use the clamped
  // value everywhere. Clamping only the lookup left `?case=-1` rendering no
  // detail block and `?case=99` highlighting no tab while showing case 0.
  const activeIndex = Math.min(Math.max(rawIndex, 0), Math.max(testcases.length - 1, 0));
  const active = testcases[activeIndex];

  const resultById = new Map(verdict.testcases.map(result => [result.testcaseId, result]));
  const visibleIds = new Set(testcases.map(testcase => testcase.id));
  const hiddenResults = verdict.testcases.filter(result => !visibleIds.has(result.testcaseId));
  const hiddenPassed = hiddenResults.filter(isPassed).length;
  const compiledOk =
    verdict.testcases.length > 0 &&
    !verdict.testcases.some(result => result.status === COMPILATION_ERROR);
  // The judge counts every testcase, public and hidden, so its own totals win.
  // Falling back to the public count alone under-reported a run as "3/3" when
  // the server had said 3 of 5.
  const total =
    Math.max(verdict.passed + verdict.failed, verdict.testcases.length) || testcases.length;

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
              <span
                aria-hidden="true"
                className={cn(
                  'absolute top-1/2 left-[6px] size-[10px] -translate-y-1/2 rounded-full',
                  passed ? 'bg-code-passed-dot' : 'bg-code-failed-dot'
                )}
              />
              <span className="absolute top-[8px] left-[30px] whitespace-nowrap">
                Case {index + 1}
              </span>
              {result && <span className="sr-only">{passed ? 'passed' : 'failed'}</span>}
            </button>
          );
        })}
        {testcasesUnavailable && (
          <div
            role="alert"
            className="flex h-[35px] items-center gap-3 rounded-[10px] bg-code-inset px-3 font-sans text-[13px] font-bold text-code-fail"
          >
            <span>Couldn&rsquo;t load the sample cases.</span>
            {onRetryTestcases && (
              <button
                type="button"
                onClick={onRetryTestcases}
                className="cursor-pointer underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                Retry
              </button>
            )}
          </div>
        )}
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
      <div
        className={cn(
          'mt-[8.42px] mr-[20px] ml-[20px] rounded-[6px] bg-code-inset pt-[3.63px] pr-[12px] pl-[6px]',
          compiledOk ? 'h-[33.585px]' : 'min-h-[33.585px] max-h-[140px] overflow-y-auto pb-[6px]'
        )}
      >
        <p
          title={compiledOk ? undefined : verdict.description}
          className={cn(
            'font-sans text-[13px] leading-[25.075px] font-bold',
            compiledOk ? 'truncate text-code-passed-text' : 'text-code-fail'
          )}
        >
          {compiledOk ? 'Compilation Successful !!' : 'Compilation Failed !!'}
        </p>
        {!compiledOk && verdict.description && !verdict.description.includes('Test Cases Passed') && (
          <pre className="mt-1 font-sans text-[12px] leading-[18px] text-code-fail break-words whitespace-pre-wrap">
            {verdict.description}
          </pre>
        )}
      </div>

      {active && <TestcaseCase testcase={active} result={resultById.get(active.id)} />}
    </section>
  );
}
