// Half the 1.4px stroke, so the outline sits inside the element box.
const INSET = 0.7;
// How far the bottom tab hangs below the body.
export const BLOCK_TAB_DEPTH = 6.5;

const n = (value: number) => +value.toFixed(2);

/**
 * Outline of a Scratch stack block from Figma node 323:2374 for a body of
 * `width` × `height`: top notch and bottom tab at a fixed 30–60px from the
 * left, 9px corners. The tab extends `BLOCK_TAB_DEPTH` below `height`.
 */
export function stackBlockPath(width: number, height: number): string {
  const s = INSET;
  const r = width - INSET;
  const b = height - INSET;
  const t = b + BLOCK_TAB_DEPTH;
  return [
    `M9.7 ${s}H29.7C32.7 ${s} 33.7 6.7 38.7 6.7H50.7C55.7 6.7 56.7 ${s} 59.7 ${s}`,
    `H${n(r - 10)}C${n(r - 4)} ${s} ${n(r)} 3.7 ${n(r)} 9.7`,
    `V${n(b - 9)}C${n(r)} ${n(b - 3)} ${n(r - 4)} ${n(b)} ${n(r - 10)} ${n(b)}`,
    `H59.7C56.7 ${n(b)} 55.7 ${n(t)} 50.7 ${n(t)}H38.7C33.7 ${n(t)} 32.7 ${n(b)} 29.7 ${n(b)}`,
    `H9.7C3.7 ${n(b)} ${s} ${n(b - 3)} ${s} ${n(b - 9)}V9.7C${s} 3.7 3.7 ${s} 9.7 ${s}Z`,
  ].join('');
}
