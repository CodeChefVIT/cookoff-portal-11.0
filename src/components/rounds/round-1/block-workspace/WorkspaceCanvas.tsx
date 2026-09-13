'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

import { Button } from '@/components/ui/button';

import type { VisualBlock } from '../../types';
import { DraggableBlock } from './DraggableBlock';

export interface WorkspaceCanvasProps {
  /** Currently assembled, ordered chain. */
  blocks: VisualBlock[];
  onRemove: (blockId: string) => void;
  onMove: (from: number, to: number) => void;
  onClear: () => void;
  disabled?: boolean;
}

/** The one drop target for palette blocks — matching the Figma copy "Only one chain is allowed". */
export const CHAIN_DROPZONE_ID = 'chain-dropzone';

interface ChainItemProps {
  block: VisualBlock;
  index: number;
  total: number;
  onRemove: (id: string) => void;
  onMove: (from: number, to: number) => void;
  disabled?: boolean;
}

function ChainItem({ block, index, total, onRemove, onMove, disabled }: ChainItemProps) {
  const { setNodeRef, listeners, transform, transition, isDragging } = useSortable({
    id: block.id,
    data: { origin: 'chain' },
    disabled,
  });

  return (
    <div
      className="flex items-center gap-1"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition ?? undefined,
        opacity: isDragging ? 0.4 : 1,
      }}
    >
      <DraggableBlock
        ref={setNodeRef}
        block={block}
        variant="chain"
        {...(disabled ? {} : listeners)}
      />
      <div className="flex shrink-0 flex-col gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={`Move "${block.content}" up`}
          onClick={() => onMove(index, index - 1)}
          disabled={disabled || index === 0}
        >
          <ChevronUp aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={`Move "${block.content}" down`}
          onClick={() => onMove(index, index + 1)}
          disabled={disabled || index === total - 1}
        >
          <ChevronDown aria-hidden="true" />
        </Button>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label={`Remove "${block.content}" from the chain`}
        onClick={() => onRemove(block.id)}
        disabled={disabled}
      >
        <X aria-hidden="true" />
      </Button>
    </div>
  );
}

/**
 * ROUND 1 - Workspace Canvas ("scratch interface" in the Figma).
 *
 * One `SortableContext` — "Only one chain is allowed" holds by
 * construction, since there is nowhere else to drop a block into.
 */
export function WorkspaceCanvas({
  blocks,
  onRemove,
  onMove,
  onClear,
  disabled,
}: WorkspaceCanvasProps) {
  const { setNodeRef } = useDroppable({ id: CHAIN_DROPZONE_ID, data: { origin: 'chain' } });

  return (
    <section
      aria-label="Your chain"
      className="flex h-full min-h-0 flex-col gap-3 rounded-2xl border border-border bg-card p-4 text-card-foreground"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-lg text-brand">Your Chain</h2>
        {blocks.length > 0 && (
          <Button type="button" variant="ghost" size="sm" onClick={onClear} disabled={disabled}>
            Clear chain
          </Button>
        )}
      </div>
      <div
        ref={setNodeRef}
        className="flex min-h-[12rem] flex-1 flex-col gap-2 overflow-y-auto rounded-xl border border-dashed border-hairline/50 p-3"
      >
        {blocks.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-1 text-center text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Start building your chain</p>
            <p>Drag blocks and drop here</p>
            <p>Only one chain is allowed</p>
          </div>
        ) : (
          <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
            {blocks.map((block, index) => (
              <ChainItem
                key={block.id}
                block={block}
                index={index}
                total={blocks.length}
                onRemove={onRemove}
                onMove={onMove}
                disabled={disabled}
              />
            ))}
          </SortableContext>
        )}
      </div>
    </section>
  );
}
