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
    const handle = event.currentTarget;
    const widths = neighbourWidths(handle);
    if (!widths) return;
    event.preventDefault();

    const startX = event.clientX;
    const start = columns;
    handle.setPointerCapture(event.pointerId);

    const onMove = (move: globalThis.PointerEvent) =>
      setColumns(resizeColumns(start, widths[0], widths[1], move.clientX - startX));
    const onEnd = () => {
      handle.removeEventListener('pointermove', onMove);
      handle.removeEventListener('pointerup', onEnd);
      handle.removeEventListener('pointercancel', onEnd);
    };
    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup', onEnd);
    handle.addEventListener('pointercancel', onEnd);
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
