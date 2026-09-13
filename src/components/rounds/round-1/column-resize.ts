/** No Round 1 panel can be dragged narrower than this. */
export const MIN_PANEL_PX = 220;

/**
 * Column fractions after dragging the divider that follows column `index` by
 * `deltaPx`, given the two neighbouring columns' pixel widths when the drag
 * started. Only those two columns change, their combined share is preserved,
 * and each keeps at least `MIN_PANEL_PX`.
 */
export function resizePair(
  fractions: readonly number[],
  index: number,
  widthBefore: number,
  widthAfter: number,
  deltaPx: number
): number[] {
  const before = fractions[index];
  const after = fractions[index + 1];
  const totalPx = widthBefore + widthAfter;
  if (before === undefined || after === undefined || totalPx <= MIN_PANEL_PX * 2) {
    return [...fractions];
  }

  const nextBeforePx = Math.min(
    Math.max(widthBefore + deltaPx, MIN_PANEL_PX),
    totalPx - MIN_PANEL_PX
  );
  const pair = before + after;
  const nextBefore = (pair * nextBeforePx) / totalPx;

  const next = [...fractions];
  next[index] = nextBefore;
  next[index + 1] = pair - nextBefore;
  return next;
}
