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

import { cn } from '@/lib/utils';
import { EMPTY_CHAIN, useChainStore } from '@/stores';

import { useRoundExpired, useVisualBlocks, useVisualSubmissionState } from '../hooks';
import { ProblemPanel } from '../ProblemPanel';
import { SolvedBox } from '../SolvedBox';
import type { Question, VisualSubmissionResult } from '../types';
import { DraggableBlock, WorkspaceCanvas } from './block-workspace';
import { BlockPalette } from './BlockPalette';
import { insertIndexFor, paletteFor, resolveChain } from './chain';
import { scratchPanelVariants } from './scratch-panel';
import { ScratchLayout } from './ScratchLayout';
import { ScratchPanelTitle } from './ScratchPanelTitle';
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
}

/**
 * Which verdict the player has already dismissed, per question. Module state
 * rather than component state so it survives the remount a question-tab switch
 * causes; not persisted, so a page reload shows the celebration once more.
 */
const dismissedResults = new Map<string, VisualSubmissionResult>();

export function ScratchEngine({ question }: ScratchEngineProps) {
  const blocksQuery = useVisualBlocks(question.id);
  const blocks = blocksQuery.data ?? [];

  const chain = useChainStore(state => state.chains[question.id] ?? EMPTY_CHAIN);
  const setChain = useChainStore.use.setChain();
  const addBlock = useChainStore.use.addBlock();
  const removeBlock = useChainStore.use.removeBlock();
  const moveBlock = useChainStore.use.moveBlock();
  const clearChain = useChainStore.use.clearChain();

  const isExpired = useRoundExpired();
  const { result, isPending } = useVisualSubmissionState(question.id);

  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [dismissedResult, setDismissedResultState] = useState<VisualSubmissionResult | null>(
    () => dismissedResults.get(question.id) ?? null
  );

  // Dismissal has to outlive the component: `result` lives in the mutation
  // cache for the 5min gcTime, but this state died on every unmount, so
  // tabbing away from a solved question and back re-opened the celebration
  // over the workspace.
  const setDismissedResult = (value: VisualSubmissionResult | null) => {
    if (value === null) dismissedResults.delete(question.id);
    else dismissedResults.set(question.id, value);
    setDismissedResultState(value);
  };

  const [trackedQuestionId, setTrackedQuestionId] = useState(question.id);
  if (trackedQuestionId !== question.id) {
    setTrackedQuestionId(question.id);
    setDismissedResultState(dismissedResults.get(question.id) ?? null);
  }

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
  // Frozen while a verdict is in flight too: `mutate` snapshots the chain at
  // call time, so editing during "Checking your chain…" produced a verdict
  // describing the old chain while the screen showed the new one.
  const disabled = isExpired || isPending;

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
      addBlock(
        question.id,
        activeId,
        overIndex === -1
          ? undefined
          : insertIndexFor(overIndex, active.rect.current.translated, over.rect)
      );
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

  if (blocksQuery.isLoading) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center" role="status">
        <span className="text-sm text-muted-foreground">Loading blocks…</span>
      </div>
    );
  }

  if (blocksQuery.isError) {
    return (
      <div className="flex min-h-[50dvh] flex-col items-center justify-center gap-3">
        <p className="text-sm text-muted-foreground">
          Couldn&rsquo;t load the blocks for this problem.
        </p>
        <button
          type="button"
          onClick={() => void blocksQuery.refetch()}
          className="rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
      >
        <ScratchLayout
          question={
            <ProblemPanel
              question={question}
              heading={<ScratchPanelTitle>Question</ScratchPanelTitle>}
              className={cn(
                scratchPanelVariants({ tone: 'question' }),
                'block overflow-y-auto px-5 pt-0 pb-5'
              )}
            />
          }
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
        <SolvedBox
          open={resultOpen}
          onClose={() => setDismissedResult(result)}
          question={question}
          pointsAwarded={result.pointsAwarded}
          alreadyAnswered={result.alreadyAnswered}
          showReward={false}
        />
      )}
    </>
  );
}
