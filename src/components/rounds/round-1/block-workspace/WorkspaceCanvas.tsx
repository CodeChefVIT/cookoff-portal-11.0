'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { VisualBlock } from '@/types';

import { scratchPanelVariants } from '../scratch-panel';
import { ScratchPanelTitle } from '../ScratchPanelTitle';
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
      className="flex items-center gap-1 text-scratch-ink"
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
      className={cn(scratchPanelVariants({ tone: 'chain' }), 'h-auto flex-1')}
    >
      <ScratchPanelTitle>Scratch Interface</ScratchPanelTitle>
      {blocks.length > 0 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClear}
          disabled={disabled}
          className="absolute top-4 right-4 font-scratch-sans text-scratch-ink"
        >
          Clear chain
        </Button>
      )}
      {blocks.length === 0 && (
        // Centred on the whole panel (not the area under the title), 8px low — as in the Figma.
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-4 text-center">
          <p className="font-scratch-display text-[24px] leading-normal tracking-[0.6px] text-scratch-ink lg:text-[30px]">
            Start building your chain
          </p>
          <div className="mt-3 font-scratch-sans text-[18px] leading-normal font-thin tracking-[0.48px] text-white [font-variation-settings:'opsz'_14] lg:text-[24px]">
            <p>Drag blocks and drop here</p>
            <p>Only one chain is allowed</p>
          </div>
        </div>
      )}
      <div
        ref={setNodeRef}
        className="flex min-h-[12rem] flex-1 flex-col gap-2 overflow-y-auto px-6 pb-6"
      >
        {blocks.length > 0 && (
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
