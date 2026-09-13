'use client';

import { useDraggable } from '@dnd-kit/core';

import { cn } from '@/lib/utils';

import type { VisualBlock } from '../types';
import { DraggableBlock } from './block-workspace';
import { scratchPanelVariants } from './scratch-panel';
import { ScratchPanelTitle } from './ScratchPanelTitle';

export interface BlockPaletteProps {
  /** Blocks not yet placed in the chain — a block leaves the palette once it's used (see `paletteFor` in `chain.ts`). */
  blocks: VisualBlock[];
  onAdd: (blockId: string) => void;
  disabled?: boolean;
}

interface PaletteItemProps {
  block: VisualBlock;
  onAdd: (id: string) => void;
  disabled?: boolean;
}

function PaletteItem({ block, onAdd, disabled }: PaletteItemProps) {
  const { setNodeRef, listeners, transform, isDragging } = useDraggable({
    id: block.id,
    data: { origin: 'palette' },
    disabled,
  });

  return (
    <DraggableBlock
      ref={setNodeRef}
      block={block}
      variant="palette"
      onActivate={disabled ? undefined : () => onAdd(block.id)}
      style={
        transform
          ? {
              transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
              opacity: isDragging ? 0.4 : 1,
            }
          : undefined
      }
      {...(disabled ? {} : listeners)}
    />
  );
}

/**
 * ROUND 1 - Block Palette ("scratch blocks" in the Figma).
 *
 * A flat list — there are no Motion/Control/Operators/Variables tabs,
 * because a block is just `{id, content}` with no category (AGENTS.md).
 */
export function BlockPalette({ blocks, onAdd, disabled }: BlockPaletteProps) {
  return (
    <section
      aria-label="Available blocks"
      className={cn(scratchPanelVariants({ tone: 'blocks' }), 'lg:h-[calc(100%-4px)]')}
    >
      <ScratchPanelTitle>Scratch Blocks</ScratchPanelTitle>
      {/* Figma's category tabs are dropped (L16), so the well rises to sit under the title. */}
      <div className="mx-3 mt-[14px] mb-3 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto rounded-[20px] border border-scratch-border/50 bg-scratch-well/50 p-3 lg:mx-[20px] lg:mb-[32px]">
        {blocks.length === 0 ? (
          <p className="p-4 text-center font-scratch-sans text-sm text-scratch-ink/70">
            Every block is in your chain.
          </p>
        ) : (
          blocks.map(block => (
            <PaletteItem key={block.id} block={block} onAdd={onAdd} disabled={disabled} />
          ))
        )}
      </div>
    </section>
  );
}
