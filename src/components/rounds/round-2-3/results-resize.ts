/** The editor slot (round pill, Monaco, line/column readout, action row) can't be squeezed below this. */
export const MIN_EDITOR_SLOT_PX = 260;

/** Nor the results panel — the count banner, case tabs and compiler message still fit. */
export const MIN_RESULTS_PX = 160;

/**
 * Results-panel height after dragging the divider above it by `deltaPx`
 * (positive = down, shrinking the results), given the editor slot's and the
 * results panel's pixel heights when the drag started. Their combined height
 * is preserved and each keeps its minimum.
 */
export function resizeResults(editorPx: number, resultsPx: number, deltaPx: number): number {
  const totalPx = editorPx + resultsPx;
  if (totalPx <= MIN_EDITOR_SLOT_PX + MIN_RESULTS_PX) return resultsPx;
  return Math.min(Math.max(resultsPx - deltaPx, MIN_RESULTS_PX), totalPx - MIN_EDITOR_SLOT_PX);
}
