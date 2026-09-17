import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type * as ApiModule from '@/api';
import { timerKeys } from '@/api';
import type { RoundTime } from '@/api/timer';

import { useRoundExpired, useRoundTimeQuery, useRoundTimer } from '../use-round-timer';

const { getRoundTimeMock } = vi.hoisted(() => ({ getRoundTimeMock: vi.fn() }));

vi.mock('@/api', async () => {
  const actual = await vi.importActual<typeof ApiModule>('@/api');
  return { ...actual, getRoundTime: getRoundTimeMock };
});

const START = Date.UTC(2026, 8, 17, 12, 0, 0);

function roundTime(endMs: number): RoundTime {
  return {
    serverTime: new Date(START),
    roundStartTime: new Date(START),
    roundEndTime: new Date(endMs),
    round: 2,
  };
}

function setup(endMs: number) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  queryClient.setQueryData(timerKeys.all(), roundTime(endMs));
  getRoundTimeMock.mockImplementation(async () => roundTime(endMs));
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return { queryClient, wrapper: Wrapper };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(START);
});

afterEach(() => {
  vi.useRealTimers();
  getRoundTimeMock.mockReset();
});

describe('useRoundTimer', () => {
  it('counts down every second', async () => {
    const { wrapper } = setup(START + 60_000);
    const { result } = renderHook(() => useRoundTimer(), { wrapper });

    const seconds = () => Math.floor((result.current.remaining ?? 0) / 1000);
    expect(seconds()).toBe(60);
    // Ticks land just past each whole second, so the shown second is never stale.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1_050);
    });
    expect(seconds()).toBe(58);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2_000);
    });
    expect(seconds()).toBe(56);
  });
});

describe('useRoundExpired', () => {
  it('flips once the end time passes without re-rendering every second', async () => {
    const { wrapper } = setup(START + 5_000);
    let renders = 0;
    const { result } = renderHook(
      () => {
        renders += 1;
        return useRoundExpired();
      },
      { wrapper }
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    const settledRenders = renders;

    await act(async () => {
      await vi.advanceTimersByTimeAsync(4_000);
    });
    expect(result.current).toBe(false);
    expect(renders).toBe(settledRenders);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1_000);
    });
    expect(result.current).toBe(true);
  });

  it('re-arms when the end time is extended', async () => {
    const { queryClient, wrapper } = setup(START + 5_000);
    const { result } = renderHook(() => useRoundExpired(), { wrapper });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2_000);
      queryClient.setQueryData(timerKeys.all(), roundTime(START + 60_000));
      getRoundTimeMock.mockImplementation(async () => roundTime(START + 60_000));
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });
    expect(result.current).toBe(false);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(48_000);
    });
    expect(result.current).toBe(true);
  });
});

describe('useRoundTimeQuery', () => {
  it('fetches once for the sync owner and lets every other reader share it', async () => {
    getRoundTimeMock.mockImplementation(async () => roundTime(START + 60_000));
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    function Wrapper({ children }: { children: ReactNode }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    }

    renderHook(() => useRoundTimeQuery({ sync: true }), { wrapper: Wrapper });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    // Readers mounted after the owner's response (as the workspace is) reuse it.
    renderHook(
      () => {
        useRoundTimer();
        useRoundExpired();
        return useRoundTimeQuery();
      },
      { wrapper: Wrapper }
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(getRoundTimeMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(120_000);
    });
    expect(getRoundTimeMock).toHaveBeenCalledTimes(2);
  });
});
