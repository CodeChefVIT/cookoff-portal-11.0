import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { CODE_RESULTS_HEIGHT_DEFAULT, SCRATCH_COLUMNS_DEFAULT, useUiStore } from '../ui-store';

describe('useUiStore', () => {
  beforeEach(() => {
    useUiStore.setState({
      sidebarOpen: false,
      scratchColumns: SCRATCH_COLUMNS_DEFAULT,
      codeResultsHeight: CODE_RESULTS_HEIGHT_DEFAULT,
    });
  });

  it('defaults the R2/R3 results panel to the Figma 355px', () => {
    const { result } = renderHook(() => useUiStore.use.codeResultsHeight());
    expect(result.current).toBe(355);
  });

  it('setCodeResultsHeight replaces the results panel height', () => {
    const { result } = renderHook(() => useUiStore.use.codeResultsHeight());
    act(() => useUiStore.getState().setCodeResultsHeight(420));
    expect(result.current).toBe(420);
  });

  it('defaults the Round 1 columns to the Figma widths', () => {
    const { result } = renderHook(() => useUiStore.use.scratchColumns());
    expect(result.current).toEqual([314, 559, 465]);
  });

  it('setScratchColumns replaces the column fractions', () => {
    const { result } = renderHook(() => useUiStore.use.scratchColumns());
    act(() => useUiStore.getState().setScratchColumns([300, 600, 438]));
    expect(result.current).toEqual([300, 600, 438]);
  });

  it('has sidebarOpen false by default', () => {
    const { result } = renderHook(() => useUiStore.use.sidebarOpen());
    expect(result.current).toBe(false);
  });

  it('setSidebarOpen sets the value directly', () => {
    const { result } = renderHook(() => useUiStore.use.sidebarOpen());
    act(() => useUiStore.getState().setSidebarOpen(true));
    expect(result.current).toBe(true);
  });

  it('toggleSidebar flips the value', () => {
    const { result } = renderHook(() => useUiStore.use.sidebarOpen());
    act(() => useUiStore.getState().toggleSidebar());
    expect(result.current).toBe(true);
    act(() => useUiStore.getState().toggleSidebar());
    expect(result.current).toBe(false);
  });
});
