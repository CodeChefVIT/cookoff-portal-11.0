import type { CSSProperties } from 'react';

import { cn } from '@/lib/utils';

export interface EditorToolbarProps {
  onRun?: () => void;
  isRunning?: boolean;
  onSubmit: () => void;
  isSubmitting: boolean;
  disabled?: boolean;
  customInputEnabled: boolean;
  onToggleCustomInput: () => void;
  className?: string;
}

const TOGGLE_MASK: CSSProperties = {
  maskImage: 'url(/code-round/toggle.png)',
  WebkitMaskImage: 'url(/code-round/toggle.png)',
  maskSize: '100% 100%',
  WebkitMaskSize: '100% 100%',
};

const BUTTON_SHADOW = 'shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]';

export function EditorToolbar({
  onRun,
  isRunning = false,
  onSubmit,
  isSubmitting,
  disabled,
  customInputEnabled,
  onToggleCustomInput,
  className,
}: EditorToolbarProps) {
  return (
    <div
      className={cn(
        'relative flex flex-wrap items-center justify-between gap-3 py-2 lg:block lg:h-[31.8px] lg:py-0',
        className
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={customInputEnabled}
        onClick={onToggleCustomInput}
        className="flex cursor-pointer items-center gap-[10px] rounded-[6px] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none lg:absolute lg:top-0 lg:left-0 lg:h-full lg:w-[235px]"
      >
        <span
          aria-hidden="true"
          style={TOGGLE_MASK}
          className={cn(
            'size-[31.72px] shrink-0 lg:absolute lg:top-[0.11px] lg:left-[9.64px]',
            customInputEnabled ? '-scale-x-100 bg-brand-accent' : 'bg-code-toggle'
          )}
        />
        <span className="font-sans text-[16px] leading-[25.075px] font-semibold whitespace-nowrap text-white lg:absolute lg:top-[7.04px] lg:left-[52px]">
          Provide Custom Input
        </span>
      </button>
      <div className="flex items-center gap-[17px]">
        <button
          type="button"
          onClick={onRun}
          disabled={disabled || isRunning || isSubmitting}
          className={cn(
            'h-[26.4px] w-[161.2px] rounded-[10px] bg-code-run font-sans text-[16px] leading-[25.075px] font-semibold text-white enabled:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 lg:absolute lg:top-[5.41px] lg:right-[174.9px]',
            BUTTON_SHADOW
          )}
        >
          {isRunning ? 'Running…' : 'Run Code'}
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={disabled || isSubmitting || isRunning}
          className={cn(
            'h-[26.4px] w-[161px] rounded-[10px] bg-brand-accent pb-[2.2px] font-inria text-[20px] leading-[25.075px] font-bold text-white enabled:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 lg:absolute lg:top-[2.44px] lg:-right-[3px]',
            BUTTON_SHADOW
          )}
        >
          {isSubmitting ? 'Submitting…' : 'Submit Code'}
        </button>
      </div>
    </div>
  );
}
