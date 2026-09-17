'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { computeClockOffset, getRoundTime, remainingMs, timerKeys } from '@/api';

const RESYNC_INTERVAL_MS = 120_000;
const TICK_INTERVAL_MS = 1_000;

export interface UseRoundTimerResult {
  /** Milliseconds remaining until `roundEndTime`, or `null` while the clock hasn't synced yet. */
  remaining: number | null;
  isUrgent: boolean;
  isExpired: boolean;
  isLoading: boolean;
  isError: boolean;
}

/**
 * The client clock is never trusted (see AGENTS.md). `offset = server_time -
 * Date.now()` is computed once per fetch and re-synced every 120s, matching
 * `cookoff-admin-11.0`'s timer page. Local ticking only advances the display;
 * it never substitutes for a fresh `/getTime` read at expiry.
 */
export function useRoundTimer(onExpire?: () => void): UseRoundTimerResult {
  const query = useQuery({
    queryKey: timerKeys.all(),
    queryFn: getRoundTime,
    staleTime: 0,
    refetchInterval: RESYNC_INTERVAL_MS,
    refetchOnWindowFocus: true,
  });

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), TICK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const offset = query.data ? computeClockOffset(query.data.serverTime) : 0;
  // No end time means the round isn't running — show no countdown rather than 0:00.
  const remaining = query.data?.roundEndTime ? remainingMs(query.data.roundEndTime, offset) : null;
  const isExpired = remaining !== null && remaining <= 0;

  useEffect(() => {
    if (isExpired) onExpire?.();
    // `now` intentionally drives re-evaluation of `isExpired` on every tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpired, now]);

  return {
    remaining,
    isUrgent: remaining !== null && remaining <= 5 * 60_000,
    isExpired,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
