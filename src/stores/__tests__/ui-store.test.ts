import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { SCRATCH_COLUMNS_DEFAULT, useUiStore } from '../ui-store';

describe('useUiStore', () => {
  beforeEach(() => {
    useUiStore.setState({ sidebarOpen: false, scratchColumns: SCRATCH_COLUMNS_DEFAULT });
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
