import { beforeEach, describe, expect, it } from 'vitest';

import { useChainStore } from '../chain-store';

function reset() {
  useChainStore.setState({ chains: {} });
}

describe('useChainStore', () => {
  beforeEach(reset);

  it('keeps chains isolated per question id', () => {
    useChainStore.getState().addBlock('q1', 'a');
    useChainStore.getState().addBlock('q2', 'b');

    expect(useChainStore.getState().getChain('q1')).toEqual(['a']);
    expect(useChainStore.getState().getChain('q2')).toEqual(['b']);
  });

  it('appends blocks in order by default', () => {
    useChainStore.getState().addBlock('q1', 'a');
    useChainStore.getState().addBlock('q1', 'b');
    useChainStore.getState().addBlock('q1', 'c');

    expect(useChainStore.getState().getChain('q1')).toEqual(['a', 'b', 'c']);
  });

  it('inserts a block at a given index', () => {
    useChainStore.getState().setChain('q1', ['a', 'c']);
    useChainStore.getState().addBlock('q1', 'b', 1);

    expect(useChainStore.getState().getChain('q1')).toEqual(['a', 'b', 'c']);
  });

  it('does not add the same block twice (blocks are used once)', () => {
    useChainStore.getState().addBlock('q1', 'a');
    useChainStore.getState().addBlock('q1', 'a');

    expect(useChainStore.getState().getChain('q1')).toEqual(['a']);
  });

  it('removes a block from the chain', () => {
    useChainStore.getState().setChain('q1', ['a', 'b', 'c']);
    useChainStore.getState().removeBlock('q1', 'b');

    expect(useChainStore.getState().getChain('q1')).toEqual(['a', 'c']);
  });

  it('moves a block to a new position', () => {
    useChainStore.getState().setChain('q1', ['a', 'b', 'c', 'd']);
    useChainStore.getState().moveBlock('q1', 0, 2);

    expect(useChainStore.getState().getChain('q1')).toEqual(['b', 'c', 'a', 'd']);
  });

  it('ignores an out-of-range move', () => {
    useChainStore.getState().setChain('q1', ['a', 'b', 'c']);
    useChainStore.getState().moveBlock('q1', 0, 10);

    expect(useChainStore.getState().getChain('q1')).toEqual(['a', 'b', 'c']);
  });

  it('clears a chain without touching other questions', () => {
    useChainStore.getState().setChain('q1', ['a', 'b']);
    useChainStore.getState().setChain('q2', ['c']);
    useChainStore.getState().clearChain('q1');

    expect(useChainStore.getState().getChain('q1')).toEqual([]);
    expect(useChainStore.getState().getChain('q2')).toEqual(['c']);
  });

  it('returns an empty array for a question with no chain yet', () => {
    expect(useChainStore.getState().getChain('unknown')).toEqual([]);
  });
});
