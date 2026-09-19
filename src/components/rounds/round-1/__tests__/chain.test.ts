import { describe, expect, it } from 'vitest';

import type { VisualBlock } from '@/types';

import { insertIndexFor, moveItem, paletteFor, resolveChain } from '../chain';

const BLOCKS: VisualBlock[] = [
  { id: 'a', content: 'Set count to 1' },
  { id: 'b', content: 'Repeat 5 times' },
  { id: 'c', content: 'Print count' },
];

describe('paletteFor', () => {
  it('returns every block when the chain is empty', () => {
    expect(paletteFor(BLOCKS, [])).toEqual(BLOCKS);
  });

  it('excludes blocks already placed in the chain', () => {
    expect(paletteFor(BLOCKS, ['b'])).toEqual([BLOCKS[0], BLOCKS[2]]);
  });

  it('returns an empty palette once every block is placed', () => {
    expect(paletteFor(BLOCKS, ['a', 'b', 'c'])).toEqual([]);
  });
});

describe('resolveChain', () => {
  it('resolves ids back into block data, in chain order', () => {
    expect(resolveChain(BLOCKS, ['c', 'a'])).toEqual([BLOCKS[2], BLOCKS[0]]);
  });

  it('drops an id the server no longer returns for this question', () => {
    expect(resolveChain(BLOCKS, ['a', 'stale-id', 'c'])).toEqual([BLOCKS[0], BLOCKS[2]]);
  });

  it('returns an empty array for an empty chain', () => {
    expect(resolveChain(BLOCKS, [])).toEqual([]);
  });
});

describe('moveItem', () => {
  it('moves an item forward', () => {
    expect(moveItem(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd']);
  });

  it('moves an item backward', () => {
    expect(moveItem(['a', 'b', 'c', 'd'], 3, 1)).toEqual(['a', 'd', 'b', 'c']);
  });

  it('is a no-op when from equals to', () => {
    const items = ['a', 'b', 'c'];
    expect(moveItem(items, 1, 1)).toBe(items);
  });

  it('is a no-op for an out-of-range index', () => {
    const items = ['a', 'b', 'c'];
    expect(moveItem(items, 0, 10)).toBe(items);
    expect(moveItem(items, -1, 1)).toBe(items);
  });

  it('does not mutate the input array', () => {
    const items = ['a', 'b', 'c'];
    const original = [...items];
    moveItem(items, 0, 2);
    expect(items).toEqual(original);
  });
});

describe('insertIndexFor', () => {
  const over = { top: 100, height: 40 }; // midpoint at 120

  it('inserts before the hovered block when dropped above its midpoint', () => {
    expect(insertIndexFor(2, { top: 80, height: 40 }, over)).toBe(2); // centre 100
  });

  it('inserts after the hovered block when dropped below its midpoint', () => {
    expect(insertIndexFor(2, { top: 120, height: 40 }, over)).toBe(3); // centre 140
  });

  // The whole point of the midpoint test: the final slot has to be reachable.
  it('appends past the last block', () => {
    const chainLength = 4;
    expect(insertIndexFor(chainLength - 1, { top: 200, height: 40 }, over)).toBe(chainLength);
  });

  it('falls back to the hovered index when a rect is missing', () => {
    expect(insertIndexFor(1, null, over)).toBe(1);
    expect(insertIndexFor(1, { top: 300, height: 40 }, undefined)).toBe(1);
  });
});
