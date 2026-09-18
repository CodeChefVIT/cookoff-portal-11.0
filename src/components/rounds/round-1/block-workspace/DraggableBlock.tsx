'use client';

import type { CSSProperties, KeyboardEvent } from 'react';
import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { GripVertical } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { VisualBlock } from '@/types';

import { BlockShape } from './BlockShape';

// The Scratch stack-block outline is drawn by `BlockShape`; pt clears the top notch.
const draggableBlockVariants = cva(
  'group relative isolate flex min-h-12 items-center gap-2 rounded-[9px] px-4 pt-3 pb-2.5 text-left text-sm text-scratch-ink focus-visible:ring-3 focus-visible:ring-scratch-border/40 focus-visible:outline-none',
  {
    variants: {
      variant: {
        palette: 'w-full cursor-grab active:cursor-grabbing',
        chain: 'w-full',
        overlay: 'w-full cursor-grabbing drop-shadow-lg',
      },
    },
    defaultVariants: { variant: 'palette' },
  }
);

export interface DraggableBlockProps extends VariantProps<typeof draggableBlockVariants> {
  block: VisualBlock;
  /** Palette tiles only: tap/Enter appends the block to the end of the chain — the primary mobile/keyboard path. */
  onActivate?: () => void;
  style?: CSSProperties;
  className?: string;
}

/**
 * ROUND 1 - Draggable Block
 *
 * The tile shared by the palette (`variant="palette"`, a plain drag
 * source — see `BlockPalette`), the chain (`variant="chain"`, sortable —
 * see `WorkspaceCanvas`), and `DragOverlay` (`variant="overlay"`, a static
 * preview with no handlers of its own). dnd-kit's `setNodeRef`/`listeners`
 * are spread onto the root via `ref`/`...rest` by the caller — never
 * `attributes`, which would layer dnd-kit's own ARIA role on top of the one
 * below and fight the chain's separate remove/move buttons for keyboard focus.
 *
 * `role="button"` + `onActivate` (rather than a real `<button>`) keeps the
 * tile keyboard-operable without a native button intercepting dnd-kit's
 * pointer listeners.
 */
export const DraggableBlock = forwardRef<HTMLDivElement, DraggableBlockProps>(
  ({ block, variant, onActivate, style, className, ...rest }, ref) => {
    function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
      if (!onActivate) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onActivate();
      }
    }

    return (
      <div
        ref={ref}
        style={style}
        role={onActivate ? 'button' : undefined}
        tabIndex={onActivate ? 0 : undefined}
        onClick={onActivate}
        onKeyDown={onKeyDown}
        className={cn(draggableBlockVariants({ variant, className }))}
        {...rest}
      >
        <BlockShape highlighted={variant === 'overlay'} />
        {variant !== 'overlay' && (
          <GripVertical aria-hidden="true" className="size-3.5 shrink-0 text-scratch-ink/50" />
        )}
        <span className="flex-1 font-mono text-xs break-words sm:text-sm">{block.content}</span>
      </div>
    );
  }
);
DraggableBlock.displayName = 'DraggableBlock';
