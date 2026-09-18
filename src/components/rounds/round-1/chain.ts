import type { VisualBlock } from '../types';

/**
 * ROUND 1 - Pure chain helpers.
 *
 * No store, no React — just the array logic `ScratchEngine` and its
 * sub-components share, kept separate so it's trivial to unit test.
 */

/** Blocks not currently placed in the chain — a block leaves the palette once it's dropped (used once). */
export function paletteFor(blocks: VisualBlock[], chain: string[]): VisualBlock[] {
  const placed = new Set(chain);
  return blocks.filter(block => !placed.has(block.id));
}

/**
 * Resolves the ordered chain of block ids back into full block data,
 * silently dropping any id the server no longer returns for this question
 * (a stale persisted chain from before the question's blocks changed).
 */
export function resolveChain(blocks: VisualBlock[], chain: string[]): VisualBlock[] {
  const byId = new Map(blocks.map(block => [block.id, block]));
  const resolved: VisualBlock[] = [];
  for (const id of chain) {
    const block = byId.get(id);
    if (block) resolved.push(block);
  }
  return resolved;
}

/** Moves the item at `from` to position `to`, returning a new array. Out-of-range indices are a no-op. */
export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || from >= items.length || to < 0 || to >= items.length) {
    return items;
  }
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

/** The vertical extent of a dragged or hovered element, as dnd-kit reports it. */
export interface VerticalRect {
  top: number;
  height: number;
}

/**
 * Where a palette block dropped over the chain item at `overIndex` should
 * land. Dropping past the hovered block's midpoint inserts *after* it, so the
 * final slot is reachable by dragging.
 *
 * Without the midpoint test every drop landed before the hovered block, and
 * once the chain filled its scroll container no reachable target appended —
 * a contestant who dragged rather than tapped could never build the last step.
 */
export function insertIndexFor(
  overIndex: number,
  activeRect: VerticalRect | null | undefined,
  overRect: VerticalRect | null | undefined
): number {
  if (!activeRect || !overRect) return overIndex;
  const activeCenter = activeRect.top + activeRect.height / 2;
  const overCenter = overRect.top + overRect.height / 2;
  return activeCenter > overCenter ? overIndex + 1 : overIndex;
}
