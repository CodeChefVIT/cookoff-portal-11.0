'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getRoundTime, timerKeys } from '@/api';

import { useSession } from './hooks';
import { RoundIntermission } from './RoundIntermission';

export interface RoundGateProps {
  roundId: 2 | 3;
  children: ReactNode;
}

/**
 * Server-authoritative access gate (see AGENTS.md authority split). Round
 * unlock is `round_qualified >= roundId` from `GET /dashboard`; the round
 * window comes from `GET /getTime`. There is no endpoint that names the
 * "current round" (L2) — qualification plus the window is the only signal.
 * On `/getTime` failure, gameplay is NOT blocked (see AGENTS.md UX states);
 * only the timer degrades.
 */
export function RoundGate({ roundId, children }: RoundGateProps) {
  const session = useSession();
  const time = useQuery({
    queryKey: timerKeys.all(),
    queryFn: getRoundTime,
    staleTime: 0,
    retry: 1,
  });

  // `Date.now()` is impure — read it only inside an effect/interval, never
  // directly during render.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(interval);
  }, []);

  if (session.isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background" role="status">
        <span className="text-sm text-muted-foreground">Loading your session…</span>
      </div>
    );
  }

  if (session.isError || !session.data) {
    return <RoundIntermission roundId={roundId} variant="notQualified" />;
  }

  if (session.data.roundQualified < roundId) {
    return <RoundIntermission roundId={roundId} variant="notQualified" />;
  }

  // `/getTime` unavailable: don't block a qualified contestant from playing —
  // fail open on the gate, fail closed only on the clock display itself.
  if (time.isError) {
    return <>{children}</>;
  }

  if (time.isLoading || !time.data || now === null) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background" role="status">
        <span className="text-sm text-muted-foreground">Checking round schedule…</span>
      </div>
    );
  }

  const start = time.data.roundStartTime?.getTime() ?? now;
  const end = time.data.roundEndTime?.getTime() ?? now;

  if (now < start) return <RoundIntermission roundId={roundId} variant="pending" />;
  if (now >= end) {
    return <RoundIntermission roundId={roundId} variant={roundId === 3 ? 'finished' : 'ended'} />;
  }

  return <>{children}</>;
}
