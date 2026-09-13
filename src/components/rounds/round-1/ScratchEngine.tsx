'use client';

import { useEffect, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';

import { useChainStore } from '@/stores';

import { useRoundTimer, useVisualBlocks, useVisualSubmissionState } from '../hooks';
import { ProblemPanel } from '../ProblemPanel';
import { ResultModal } from '../ResultModal';
import type { Question, VisualSubmissionResult } from '../types';
import { DraggableBlock, WorkspaceCanvas } from './block-workspace';
import { BlockPalette } from './BlockPalette';
import { paletteFor, resolveChain } from './chain';
import { ScratchLayout } from './ScratchLayout';
import { VisualVerdict } from './VisualVerdict';

/**
 * ROUND 1 ENGINE - Entry point for the "Scratch" round.
 *
 * THIS FOLDER IS OWNED BY THE ROUND 1 TEAM.
 *
 * Orchestrates `BlockPalette` + `WorkspaceCanvas` inside `ScratchLayout`.
 * Submission itself happens in `ChainSubmitButton` — Round 1's header
 * Submit button (`RoundConfig.headerSubmit`) — not here; this component
 * only reads the shared result via `useVisualSubmissionState`. It must be
 * wrapped by `BuyInGate` (a pass-through for R1) and `RoundShell`.
 */
export interface ScratchEngineProps {
  question: Question;
  index?: number;
}

export function ScratchEngine({ question, index }: ScratchEngineProps) {
  const blocksQuery = useVisualBlocks(question.id);
  const blocks = blocksQuery.data ?? [];

  const chain = useChainStore(state => state.chains[question.id] ?? []);
  const setChain = useChainStore.use.setChain();
  const addBlock = useChainStore.use.addBlock();
  const removeBlock = useChainStore.use.removeBlock();
  const moveBlock = useChainStore.use.moveBlock();
  const clearChain = useChainStore.use.clearChain();

  const { isExpired } = useRoundTimer();
  const { result, isPending } = useVisualSubmissionState(question.id);

  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [dismissedResult, setDismissedResult] = useState<VisualSubmissionResult | null>(null);

  // Drop any id the server no longer returns for this question — a stale
  // chain persisted from before the question's blocks changed.
  useEffect(() => {
    if (!blocksQuery.data) return;
    const resolvedIds = resolveChain(blocksQuery.data, chain).map(b => b.id);
    if (resolvedIds.length !== chain.length) setChain(question.id, resolvedIds);
    // Only re-run when the fetched block list or the question changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocksQuery.data, question.id]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const palette = paletteFor(blocks, chain);
  const chainBlocks = resolveChain(blocks, chain);
  const activeBlock = blocks.find(b => b.id === activeBlockId) ?? null;
  const disabled = isExpired;

  function onDragStart(event: DragStartEvent) {
    setActiveBlockId(String(event.active.id));
  }

  function onDragCancel() {
    setActiveBlockId(null);
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveBlockId(null);
    if (disabled) return;

    const { active, over } = event;
    if (!over) return;

    const origin = (active.data.current as { origin?: string } | undefined)?.origin;
    const activeId = String(active.id);

    if (origin === 'palette') {
      const overIndex = chain.indexOf(String(over.id));
      addBlock(question.id, activeId, overIndex === -1 ? undefined : overIndex);
      return;
    }

    if (origin === 'chain' && over.id !== active.id) {
      const overIndex = chain.indexOf(String(over.id));
      const fromIndex = chain.indexOf(activeId);
      if (overIndex === -1 || fromIndex === -1) return;
      moveBlock(question.id, fromIndex, overIndex);
    }
  }

  const resultOpen = result !== undefined && result.correct && result !== dismissedResult;

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
      >
        <ScratchLayout
          question={<ProblemPanel question={question} index={index} />}
          chain={
            <div className="flex h-full min-h-0 flex-col gap-2">
              <WorkspaceCanvas
                blocks={chainBlocks}
                onRemove={id => removeBlock(question.id, id)}
                onMove={(from, to) => moveBlock(question.id, from, to)}
                onClear={() => clearChain(question.id)}
                disabled={disabled}
              />
              <VisualVerdict result={result} isSubmitting={isPending} />
            </div>
          }
          palette={
            <BlockPalette
              blocks={palette}
              onAdd={id => addBlock(question.id, id)}
              disabled={disabled}
            />
          }
        />
        <DragOverlay>
          {activeBlock ? <DraggableBlock block={activeBlock} variant="overlay" /> : null}
        </DragOverlay>
      </DndContext>
      {result && (
        <ResultModal
          open={resultOpen}
          onClose={() => setDismissedResult(result)}
          question={question}
          pointsAwarded={result.pointsAwarded}
          alreadyAnswered={result.alreadyAnswered}
        />
      )}
    </>
  );
}
