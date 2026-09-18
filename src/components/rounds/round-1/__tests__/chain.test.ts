import { describe, expect, it } from 'vitest';

import type { VisualBlock } from '../../types';
import { moveItem, paletteFor, resolveChain } from '../chain';

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
