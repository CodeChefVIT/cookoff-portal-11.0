import type { KeyboardEvent, PointerEvent } from 'react';

import { cn } from '@/lib/utils';

export interface ColumnResizerProps {
  label: string;
  /** Where this divider sits across the row, 0–100. */
  position: number;
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  className?: string;
}

/** Drag handle in the gutter between two Round 1 panels; ←/→ nudge it from the keyboard. */
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
        'group/resizer hidden cursor-col-resize touch-none items-center justify-center select-none focus-visible:outline-none lg:row-start-1 lg:flex',
        className
      )}
    >
      <span className="h-16 w-1 rounded-full bg-scratch-border/30 transition-colors group-hover/resizer:bg-scratch-border/70 group-focus-visible/resizer:bg-scratch-border group-active/resizer:bg-scratch-border" />
    </div>
  );
}
