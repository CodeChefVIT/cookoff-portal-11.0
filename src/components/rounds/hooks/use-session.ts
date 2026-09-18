'use client';

import { useQuery } from '@tanstack/react-query';

import { getSession, sessionKeys } from '@/api';

// Readers mounted later in the same page load reuse the guard's response.
const READER_STALE_TIME_MS = 30_000;

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
    ...(sync ? { staleTime: 0, refetchOnWindowFocus: true } : { staleTime: READER_STALE_TIME_MS }),
  });
}
