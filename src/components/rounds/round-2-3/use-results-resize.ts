'use client';

import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';

import { useMounted } from '@/hooks/use-mounted';
import { CODE_RESULTS_HEIGHT_DEFAULT, useUiStore } from '@/stores';

import { resizeResults } from './results-resize';

const KEY_STEP_PX = 24;

// The resizer sits between the editor slot and the results panel in the DOM, so its siblings are what it moves.
function neighbourHeights(handle: HTMLElement) {
  const before = handle.previousElementSibling;
  const after = handle.nextElementSibling;
  if (!(before instanceof HTMLElement) || !(after instanceof HTMLElement)) return null;
  return [before.getBoundingClientRect().height, after.getBoundingClientRect().height] as const;
}

/**
 * Drag / ↑↓ resizing of the R2/R3 results panel against the editor above it,
 * persisted in `ui-store` so the split survives switching questions. Renders
 * the Figma default until mounted so the persisted value never causes a
 * hydration mismatch.
 */
export function useResultsResize() {
  const mounted = useMounted();
  // Plain selector calls, not `useUiStore.use.x()` — the React Compiler only treats `use*` callees as hooks.
  const stored = useUiStore(state => state.codeResultsHeight);
  const setHeight = useUiStore(state => state.setCodeResultsHeight);
  // Live value while dragging. `ui-store` is persisted, so writing on every
  // pointermove meant a full JSON.stringify + synchronous localStorage write
  // 60+ times a second; the drag renders from local state and commits once on
  // release. Safe here because this hook is the value's only reader.
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  const pendingHeight = useRef<number | null>(null);
  const resultsHeight = dragHeight ?? (mounted ? stored : CODE_RESULTS_HEIGHT_DEFAULT);

  function onPointerDown(event: PointerEvent<HTMLElement>) {
    // Only the primary button drags — a right-click on the gutter used to
    // start a resize that then followed the pointer around.
    if (event.button !== 0) return;
    const handle = event.currentTarget;
    const heights = neighbourHeights(handle);
    if (!heights) return;
    event.preventDefault();

    const startY = event.clientY;
    handle.setPointerCapture(event.pointerId);

    const onMove = (move: globalThis.PointerEvent) => {
      const next = resizeResults(heights[0], heights[1], move.clientY - startY);
      pendingHeight.current = next;
      setDragHeight(next);
    };
    const onEnd = () => {
      if (pendingHeight.current !== null) setHeight(pendingHeight.current);
      pendingHeight.current = null;
      setDragHeight(null);
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

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    const step =
      event.key === 'ArrowUp' ? -KEY_STEP_PX : event.key === 'ArrowDown' ? KEY_STEP_PX : 0;
    if (!step) return;
    const heights = neighbourHeights(event.currentTarget);
    if (!heights) return;
    event.preventDefault();
    setHeight(resizeResults(heights[0], heights[1], step));
  }

  return { resultsHeight, onPointerDown, onKeyDown };
}
