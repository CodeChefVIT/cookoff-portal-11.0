'use client';

import { useDraggable } from '@dnd-kit/core';

import type { VisualBlock } from '../types';
import { DraggableBlock } from './block-workspace';

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
      className="flex h-full min-h-0 flex-col gap-3 rounded-2xl border border-border bg-card p-4 text-card-foreground"
    >
      <h2 className="font-display text-lg text-brand">Available Blocks</h2>
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
        {blocks.length === 0 ? (
          <p className="p-4 text-center text-sm text-muted-foreground">
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
