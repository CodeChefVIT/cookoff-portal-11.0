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
