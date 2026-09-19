'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getRoundTime, remainingMs, timerKeys } from '@/api';

// An admin Stop or time change reaches players within this. At 350 players
// it is ~12 requests/s, served from Redis.
const RESYNC_INTERVAL_MS = 30_000;
// Readers mounted later in the same page load reuse the owner's response.
const READER_STALE_TIME_MS = 30_000;
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
 * One `GET /getTime` query shared by every timer consumer. Only the sync owner
 * (`RoundGate`, mounted around every round page) fetches on mount, re-syncs
 * every 30s and refetches on focus; every other reader just reads the cache,
 * so a page load costs one request and the resync one per interval.
 * `roundEndTime` is already in the local clock (`api/timer.ts`).
 */
export function useRoundTimeQuery({ sync = false }: { sync?: boolean } = {}) {
  return useQuery({
    queryKey: timerKeys.all(),
    queryFn: getRoundTime,
    ...(sync
      ? { staleTime: 0, refetchInterval: RESYNC_INTERVAL_MS, refetchOnWindowFocus: true }
      : { staleTime: READER_STALE_TIME_MS }),
  });
}

// Timers can fire a few ms early; landing just past the boundary keeps the
// displayed second from trailing the real one for a whole tick.
const TICK_SLACK_MS = 10;

// A single 1s clock for every mounted countdown. Each tick is scheduled from
// the wall clock to just after the next whole second (end times are whole
// seconds), so displays flip exactly when the remaining second changes and
// never accumulate `setInterval` drift. It only runs while something subscribes.
let clockNow = Date.now();
const clockListeners = new Set<() => void>();
let tickTimeout: ReturnType<typeof setTimeout> | undefined;

function tick() {
  clockNow = Date.now();
  clockListeners.forEach(listener => listener());
}

function scheduleTick() {
  const delay = TICK_INTERVAL_MS - (Date.now() % TICK_INTERVAL_MS) + TICK_SLACK_MS;
  tickTimeout = setTimeout(() => {
    tick();
    scheduleTick();
  }, delay);
}

// Background tabs throttle timers, so catch up the moment the tab is shown again.
function onVisibilityChange() {
  if (document.visibilityState !== 'visible') return;
  clearTimeout(tickTimeout);
  tick();
  scheduleTick();
}

function subscribeClock(listener: () => void) {
  clockListeners.add(listener);
  if (clockListeners.size === 1) {
    clockNow = Date.now();
    scheduleTick();
    document.addEventListener('visibilitychange', onVisibilityChange);
  }
  return () => {
    clockListeners.delete(listener);
    if (clockListeners.size > 0) return;
    clearTimeout(tickTimeout);
    document.removeEventListener('visibilitychange', onVisibilityChange);
  };
}

function getClockNow() {
  return clockNow;
}

/**
 * Live countdown for components that display the time. Re-renders once a
 * second via the shared clock — components that only need to know when the
 * round ends should use `useRoundExpired` instead.
 */
export function useRoundTimer(onExpire?: () => void): UseRoundTimerResult {
  const query = useRoundTimeQuery();
  const clock = useSyncExternalStore(subscribeClock, getClockNow, getClockNow);
  // The shared clock only advances on its tick, so a fresh `/getTime` can land
  // up to a second after its last reading; never count from before the response.
  const now = Math.max(clock, query.data?.serverTime.getTime() ?? 0);

  // No end time means the round isn't running — show no countdown rather than 0:00.
  const endTime = query.data?.roundEndTime ?? null;
  const remaining = endTime ? remainingMs(endTime, now) : null;
  const isExpired = remaining !== null && remaining <= 0;

  useEffect(() => {
    if (isExpired) onExpire?.();
    // Fire once per expiry, not whenever the caller passes a new callback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpired]);

  return {
    remaining,
    isUrgent: remaining !== null && remaining <= 5 * 60_000,
    isExpired,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

/**
 * `true` once `atMs` has passed. Arms one timeout per timestamp instead of
 * ticking, so the caller re-renders only when the moment arrives — and re-arms
 * when a resync or admin extension moves it.
 */
export function useTimePassed(atMs: number | null): boolean {
  // Mount time is the first reading, so an already-passed moment is correct on first render.
  const [checkedAt, setCheckedAt] = useState(() => Date.now());

  useEffect(() => {
    if (atMs === null) return;
    const timeout = setTimeout(() => setCheckedAt(Date.now()), Math.max(0, atMs - Date.now()));
    return () => clearTimeout(timeout);
  }, [atMs]);

  return atMs !== null && atMs <= checkedAt;
}

/** `true` once the running round's end time passes — see `useTimePassed`. */
export function useRoundExpired(): boolean {
  const query = useRoundTimeQuery();
  return useTimePassed(query.data?.roundEndTime?.getTime() ?? null);
}
