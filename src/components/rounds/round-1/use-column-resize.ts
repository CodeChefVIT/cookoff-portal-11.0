'use client';

import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';

import { useMounted } from '@/hooks/use-mounted';
import { SCRATCH_COLUMNS_DEFAULT, useUiStore } from '@/stores';

import { resizePair } from './column-resize';

const KEY_STEP_PX = 24;

// A resizer sits between its two panels in the DOM, so its siblings are the columns it moves.
function neighbourWidths(handle: HTMLElement) {
  const before = handle.previousElementSibling;
  const after = handle.nextElementSibling;
  if (!(before instanceof HTMLElement) || !(after instanceof HTMLElement)) return null;
  return [before.getBoundingClientRect().width, after.getBoundingClientRect().width] as const;
}

/**
 * Drag / arrow-key resizing for the Round 1 columns, persisted in `ui-store`
 * so widths survive switching questions. Renders the defaults until mounted
 * so the persisted value never causes a hydration mismatch.
 */
export function useColumnResize() {
  const mounted = useMounted();
  // Plain selector calls, not `useUiStore.use.x()` — the React Compiler only treats `use*` callees as hooks.
  const stored = useUiStore(state => state.scratchColumns);
  const setColumns = useUiStore(state => state.setScratchColumns);
  // Live value while dragging — see `use-results-resize` for why the persisted
  // write is deferred to release. Safe here because `ScratchLayout` is the only
  // reader of this value.
  const [dragColumns, setDragColumns] = useState<typeof stored | null>(null);
  const pendingColumns = useRef<typeof stored | null>(null);
  const columns = dragColumns ?? (mounted ? stored : SCRATCH_COLUMNS_DEFAULT);

  function onPointerDown(index: number, event: PointerEvent<HTMLElement>) {
    // Only the primary button drags — a right-click on the gutter used to
    // start a resize that then followed the pointer around.
    if (event.button !== 0) return;
    const handle = event.currentTarget;
    const widths = neighbourWidths(handle);
    if (!widths) return;
    event.preventDefault();

    const startX = event.clientX;
    const start = columns;
    handle.setPointerCapture(event.pointerId);

    const onMove = (move: globalThis.PointerEvent) => {
      const next = resizePair(start, index, widths[0], widths[1], move.clientX - startX);
      pendingColumns.current = next;
      setDragColumns(next);
    };
    const onEnd = () => {
      if (pendingColumns.current !== null) setColumns(pendingColumns.current);
      pendingColumns.current = null;
      setDragColumns(null);
      handle.removeEventListener('pointermove', onMove);
      handle.removeEventListener('pointerup', onEnd);
      handle.removeEventListener('pointercancel', onEnd);
      // Capture can be lost without a pointerup/pointercancel (an alert, a
      // window switch); without this the move listener stayed bound and the
      // pane jumped on the next hover.
      handle.removeEventListener('lostpointercapture', onEnd);
    };
    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup', onEnd);
    handle.addEventListener('pointercancel', onEnd);
    handle.addEventListener('lostpointercapture', onEnd);
  }

  function onKeyDown(index: number, event: KeyboardEvent<HTMLElement>) {
    const step =
      event.key === 'ArrowLeft' ? -KEY_STEP_PX : event.key === 'ArrowRight' ? KEY_STEP_PX : 0;
    if (!step) return;
    const widths = neighbourWidths(event.currentTarget);
    if (!widths) return;
    event.preventDefault();
    setColumns(resizePair(columns, index, widths[0], widths[1], step));
  }

  return { columns, onPointerDown, onKeyDown };
}
