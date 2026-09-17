import type { KeyboardEvent, PointerEvent } from 'react';

import { cn } from '@/lib/utils';

import { MIN_RESULTS_PX } from './results-resize';

export interface RowResizerProps {
  label: string;
  /** Current height (px) of the panel below the divider. */
  value: number;
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  className?: string;
}

/** Drag handle in Figma's 15.2px gap between the R2/R3 editor and results panels; ↑/↓ nudge it from the keyboard. */
export function RowResizer({ label, value, onPointerDown, onKeyDown, className }: RowResizerProps) {
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      aria-label={label}
      aria-valuemin={MIN_RESULTS_PX}
      aria-valuenow={Math.round(value)}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      className={cn(
        'group/resizer hidden h-[15.2px] shrink-0 cursor-row-resize touch-none items-center justify-center select-none focus-visible:outline-none lg:ml-[6px] lg:flex',
        className
      )}
    >
      <span className="h-1 w-16 rounded-full bg-code-sand/30 transition-colors group-hover/resizer:bg-code-sand/70 group-focus-visible/resizer:bg-code-sand group-active/resizer:bg-code-sand" />
    </div>
  );
}
