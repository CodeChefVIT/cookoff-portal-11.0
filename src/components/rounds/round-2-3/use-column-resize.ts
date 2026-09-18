'use client';

import type { KeyboardEvent, PointerEvent } from 'react';

import { useMounted } from '@/hooks/use-mounted';
import { CODE_COLUMNS_DEFAULT, useUiStore } from '@/stores';

import { resizeColumns } from './column-resize';

const KEY_STEP_PX = 24;

// The resizer sits between the problem and editor columns in the DOM, so its siblings are what it moves.
function neighbourWidths(handle: HTMLElement) {
  const before = handle.previousElementSibling;
  const after = handle.nextElementSibling;
  if (!(before instanceof HTMLElement) || !(after instanceof HTMLElement)) return null;
  return [before.getBoundingClientRect().width, after.getBoundingClientRect().width] as const;
}

/**
 * The persisted R2/R3 problem | editor column fractions, rendering the Figma
 * default until mounted so the stored value never causes a hydration
 * mismatch. `QuestionWorkspace` reads them too, so the question tabs it
 * overlays stay on the problem column as the divider moves.
 */
export function useWorkspaceColumns() {
  const mounted = useMounted();
  // Plain selector calls, not `useUiStore.use.x()` — the React Compiler only treats `use*` callees as hooks.
  const stored = useUiStore(state => state.codeColumns);
  return mounted ? stored : CODE_COLUMNS_DEFAULT;
}

/**
 * Drag / ←→ resizing of the R2/R3 problem column against the editor column,
 * persisted in `ui-store` so the split survives switching questions.
 */
export function useColumnResize() {
  const columns = useWorkspaceColumns();
  const setColumns = useUiStore(state => state.setCodeColumns);

  function onPointerDown(event: PointerEvent<HTMLElement>) {
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

    // Unlike the R1 columns and the results split, this value has a second
    // reader: `QuestionWorkspace` builds the question-tab overlay from the same
    // grid. Buffering the drag in local state would leave the tabs behind the
    // divider, so this one keeps writing through on every move.
    const onMove = (move: globalThis.PointerEvent) =>
      setColumns(resizeColumns(start, widths[0], widths[1], move.clientX - startX));
    const onEnd = () => {
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
      event.key === 'ArrowLeft' ? -KEY_STEP_PX : event.key === 'ArrowRight' ? KEY_STEP_PX : 0;
    if (!step) return;
    const widths = neighbourWidths(event.currentTarget);
    if (!widths) return;
    event.preventDefault();
    setColumns(resizeColumns(columns, widths[0], widths[1], step));
  }

  return { columns, onPointerDown, onKeyDown };
}
