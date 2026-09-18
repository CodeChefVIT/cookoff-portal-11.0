import type { StoreApi, UseBoundStore } from 'zustand';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { createSelectors } from './create-selectors';

/**
 * A stable shared reference for "no chain yet". A fresh `[]` literal as a
 * selector's fallback (`state.chains[id] ?? []`) allocates a new array every
 * call, which breaks `useSyncExternalStore`'s `Object.is` snapshot check and
 * causes an infinite render loop ("The result of getSnapshot should be
 * cached"). Reusing one constant keeps the fallback referentially stable.
 */
export const EMPTY_CHAIN: string[] = [];

interface ChainState {
  /**
   * questionId -> ordered block ids currently assembled in the chain. This
   * is presentation state only (see AGENTS.md authority split) — the server
   * is the only source of truth for whether a chain is correct; this store
   * just remembers what the contestant has arranged so far.
   */
  chains: Record<string, string[]>;
  getChain: (questionId: string) => string[];
  setChain: (questionId: string, blockIds: string[]) => void;
  /** Appends `blockId` at `index` (default: the end). A no-op if the block is already placed — each block is used once. */
  addBlock: (questionId: string, blockId: string, index?: number) => void;
  removeBlock: (questionId: string, blockId: string) => void;
  /** Reorders the chain, moving the item at `from` to `to`. Out-of-range indices are a no-op. */
  moveBlock: (questionId: string, from: number, to: number) => void;
  clearChain: (questionId: string) => void;
  /** Drops every question's chain — used when a different account signs in. */
  resetAll: () => void;
}

const useChainStoreBase = create<ChainState>()(
  persist(
    (set, get) => ({
      chains: {},
      getChain: questionId => get().chains[questionId] ?? EMPTY_CHAIN,
      setChain: (questionId, blockIds) =>
        set(state => ({ chains: { ...state.chains, [questionId]: blockIds } })),
      addBlock: (questionId, blockId, index) =>
        set(state => {
          const chain = state.chains[questionId] ?? EMPTY_CHAIN;
          if (chain.includes(blockId)) return state;
          const next = [...chain];
          next.splice(index ?? next.length, 0, blockId);
          return { chains: { ...state.chains, [questionId]: next } };
        }),
      removeBlock: (questionId, blockId) =>
        set(state => ({
          chains: {
            ...state.chains,
            [questionId]: (state.chains[questionId] ?? EMPTY_CHAIN).filter(id => id !== blockId),
          },
        })),
      moveBlock: (questionId, from, to) =>
        set(state => {
          const chain = state.chains[questionId] ?? EMPTY_CHAIN;
          if (from === to || from < 0 || from >= chain.length || to < 0 || to >= chain.length) {
            return state;
          }
          const next = [...chain];
          const [moved] = next.splice(from, 1);
          next.splice(to, 0, moved);
          return { chains: { ...state.chains, [questionId]: next } };
        }),
      clearChain: questionId => set(state => ({ chains: { ...state.chains, [questionId]: [] } })),
      resetAll: () => set({ chains: {} }),
    }),
    { name: 'chain-store' }
  )
) as unknown as UseBoundStore<StoreApi<ChainState>>;

export const useChainStore = createSelectors(useChainStoreBase);
