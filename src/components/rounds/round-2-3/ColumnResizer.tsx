import type { KeyboardEvent, PointerEvent } from 'react';

import { cn } from '@/lib/utils';

export interface ColumnResizerProps {
  label: string;
  /** Where this divider sits across the workspace, 0–100. */
  position: number;
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  className?: string;
}

/** Drag handle in Figma's 23px gutter between the R2/R3 problem and editor columns; ←/→ nudge it from the keyboard. */
export function ColumnResizer({
  label,
  position,
  onPointerDown,
  onKeyDown,
  className,
}: ColumnResizerProps) {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={position}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      className={cn(
        'group/resizer hidden cursor-col-resize touch-none items-center justify-center select-none focus-visible:outline-none lg:flex',
        className
      )}
    >
      <span className="h-16 w-1 rounded-full bg-code-sand/30 transition-colors group-hover/resizer:bg-code-sand/70 group-focus-visible/resizer:bg-code-sand group-active/resizer:bg-code-sand" />
    </div>
  );
}
