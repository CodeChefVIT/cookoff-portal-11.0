'use client';

import { useQuery } from '@tanstack/react-query';

import { getSession, sessionKeys } from '@/api';

/**
 * `round_qualified`, `balance`, and `score` are server-authoritative and
 * never mirrored into client state — see AGENTS.md "Rounds architecture"
 * authority split. `staleTime: 0` + `refetchOnWindowFocus: true` so a
 * returning tab sees a correct balance after a payout (D5).
 */
export function useSession() {
  return useQuery({
    queryKey: sessionKeys.all(),
    queryFn: getSession,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}
