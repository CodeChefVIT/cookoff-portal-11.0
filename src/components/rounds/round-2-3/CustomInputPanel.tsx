import type { CustomRunResult } from '@/api';
import { cn } from '@/lib/utils';

export interface CustomInputPanelProps {
  value: string;
  onChange: (value: string) => void;
  result?: CustomRunResult | null;
  isRunning?: boolean;
}

/** Custom stdin for Run Code, shown in the results slot while "Provide Custom Input" is on. */
export function CustomInputPanel({
  value,
  onChange,
  result,
  isRunning = false,
}: CustomInputPanelProps) {
  const hasOutput = result !== null && result !== undefined;
  const isPass = result?.isPassed;
  const outputText =
    result?.stdout || result?.stderr || result?.message || (hasOutput ? '(Program produced no output)' : '');

  return (
    <div className="flex h-full flex-col gap-3 rounded-[10px] bg-code-panel pt-[9px] pr-[20px] pb-[9px] pl-[21px]">
      <div className={cn('flex flex-col', hasOutput || isRunning ? 'h-[45%]' : 'h-full')}>
        <label
          htmlFor="custom-input"
          className="pl-[5px] font-inria text-[13px] leading-[25.075px] font-bold text-white"
        >
          Custom Input
        </label>
        <textarea
          id="custom-input"
          value={value}
          placeholder="Enter input to pass to stdin..."
          onChange={event => onChange(event.target.value)}
          className="mt-[4.35px] min-h-0 flex-1 resize-none rounded-[10px] bg-code-inset pt-[11.04px] pr-[12px] pl-[21px] font-sans text-[14px] leading-[25.075px] font-bold text-white outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      {isRunning && (
        <div className="flex flex-1 flex-col justify-center items-center rounded-[10px] bg-code-inset p-4 text-white">
          <p className="font-sans text-[14px] font-bold text-code-gold animate-pulse">
            Executing code with custom input…
          </p>
        </div>
      )}

      {hasOutput && !isRunning && (
        <div className="flex flex-1 min-h-0 flex-col">
          <div className="flex items-center justify-between pl-[5px]">
            <h4 className="font-inria text-[13px] leading-[25.075px] font-bold text-white">
              Output
            </h4>
            <div className="flex items-center gap-2">
              {result.time && (
                <span className="font-sans text-[12px] text-dash-ink">
                  {parseFloat(result.time).toFixed(3)}s
                </span>
              )}
              <span
                className={cn(
                  'rounded px-2 py-0.5 font-sans text-[11px] font-bold',
                  isPass ? 'bg-code-passed-bg text-white' : 'bg-code-failed-bg text-white'
                )}
              >
                {result.status.description || (isPass ? 'Accepted' : 'Failed')}
              </span>
            </div>
          </div>
          <pre className="mt-[4.35px] min-h-0 flex-1 overflow-auto rounded-[10px] bg-code-inset pt-[11.04px] pr-[12px] pl-[21px] font-sans text-[14px] leading-[25.075px] font-bold break-words whitespace-pre-wrap text-white">
            {outputText}
          </pre>
        </div>
      )}
    </div>
  );
}
