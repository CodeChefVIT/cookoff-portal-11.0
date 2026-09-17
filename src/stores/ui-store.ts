import type { StoreApi, UseBoundStore } from 'zustand';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { createSelectors } from './create-selectors';

/** Round 1 question | chain | blocks column fractions — the Figma `scratch` widths 314 : 559 : 465. */
export const SCRATCH_COLUMNS_DEFAULT: readonly number[] = [314, 559, 465];

/** R2/R3 results panel height — Figma `Desktop - 14`'s 355px. */
export const CODE_RESULTS_HEIGHT_DEFAULT = 355;

interface UiState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  scratchColumns: readonly number[];
  setScratchColumns: (columns: readonly number[]) => void;
  codeResultsHeight: number;
  setCodeResultsHeight: (height: number) => void;
}

const useUiStoreBase = create<UiState>()(
  persist(
    set => ({
      sidebarOpen: false,
      setSidebarOpen: open => set({ sidebarOpen: open }),
      toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
      scratchColumns: SCRATCH_COLUMNS_DEFAULT,
      setScratchColumns: columns => set({ scratchColumns: columns }),
      codeResultsHeight: CODE_RESULTS_HEIGHT_DEFAULT,
      setCodeResultsHeight: height => set({ codeResultsHeight: height }),
    }),
    { name: 'ui-store' }
  )
) as unknown as UseBoundStore<StoreApi<UiState>>;

export const useUiStore = createSelectors(useUiStoreBase);
