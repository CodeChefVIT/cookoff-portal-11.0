'use client';

import { useQuery } from '@tanstack/react-query';

import { getSession, sessionKeys } from '@/api';

// Readers mounted later in the same page load reuse the guard's response.
const READER_STALE_TIME_MS = 30_000;

/**
 * `round_qualified` used to refresh only on focus or after a mutation, so an
 * admin promotion left the open page on a stale round: the timer poll flipped
 * it to the "round over" intermission while the cached session still named the
 * old round, and that screen has no way forward. Poll on the same cadence as
 * the contest timer so a promotion is picked up without a manual refresh.
 */
const SESSION_RESYNC_INTERVAL_MS = 120_000;

/**
 * `round_qualified`, `balance`, and `score` are server-authoritative and
 * never mirrored into client state — see AGENTS.md "Rounds architecture"
 * authority split. Only the sync owner (`SessionGuard`, around every
 * protected page) fetches on mount and on focus, so a returning tab sees a
 * correct balance after a payout (D5); other readers share its response.
 * Buying and submitting invalidate this key, which refetches regardless.
 */
export function useSession({ sync = false }: { sync?: boolean } = {}) {
  return useQuery({
    queryKey: sessionKeys.all(),
    queryFn: getSession,
    ...(sync
      ? {
          staleTime: 0,
          refetchOnWindowFocus: true,
          refetchInterval: SESSION_RESYNC_INTERVAL_MS,
        }
      : { staleTime: READER_STALE_TIME_MS }),
  });
}
