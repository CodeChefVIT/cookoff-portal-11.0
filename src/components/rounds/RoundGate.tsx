'use client';

import type { ReactNode } from 'react';

import { LoadingScreen } from '@/components/ui';
import type { RoundId } from '@/types';

import { useRoundTimeQuery, useSession, useTimePassed } from './hooks';
import { getRoundConfig } from './round-config';
import { RoundIntermission } from './RoundIntermission';

export interface RoundGateProps {
  roundId: RoundId;
  children: ReactNode;
}

/**
 * Server-authoritative access gate (see AGENTS.md authority split). A round
 * is playable only while `round_qualified === roundId` from `GET /dashboard`
 * (below: not qualified; above: an old, closed round); the round
 * window comes from `GET /getTime`. There is no endpoint that names the
 * "current round" (L2) — qualification plus the window is the only signal.
 * On `/getTime` failure, gameplay is NOT blocked (see AGENTS.md UX states);
 * only the timer degrades.
 */
export function RoundGate({ roundId, children }: RoundGateProps) {
  const session = useSession();
  // The gate outlives every question view in a round, so it owns the timer resync.
  const time = useRoundTimeQuery({ sync: true });
  // One timeout per boundary instead of a per-second re-render of the whole page.
  const started = useTimePassed(time.data?.roundStartTime?.getTime() ?? null);
  const ended = useTimePassed(time.data?.roundEndTime?.getTime() ?? null);

  if (session.isLoading) {
    return <LoadingScreen message="Loading your session…" />;
  }

  if (session.isError || !session.data) {
    return <RoundIntermission roundId={roundId} variant="notQualified" />;
  }

  if (session.data.roundQualified < roundId) {
    return <RoundIntermission roundId={roundId} variant="notQualified" />;
  }

  // Only the current round is playable — once qualified past it, an old round
  // is closed for good, regardless of `/getTime` (which describes the current round).
  if (session.data.roundQualified > roundId) {
    return <RoundIntermission roundId={roundId} variant="ended" />;
  }

  // `/getTime` unavailable: don't block a qualified contestant from playing —
  // fail open on the gate, fail closed only on the clock display itself.
  if (time.isError) {
    return <>{children}</>;
  }

  if (time.isLoading || !time.data) {
    return <LoadingScreen message="Checking round schedule…" />;
  }

  const endedVariant = getRoundConfig(roundId).isFinalRound ? 'finished' : 'ended';
  const timerRound = time.data.round;

  // The contest timer runs one round at a time: an earlier timer round means
  // this one hasn't opened yet, a later one means it's over.
  if (timerRound !== undefined && timerRound < roundId) {
    return <RoundIntermission roundId={roundId} variant="pending" />;
  }
  if (timerRound !== undefined && timerRound > roundId) {
    return <RoundIntermission roundId={roundId} variant={endedVariant} />;
  }

  // No end time: the admin hasn't started this round yet.
  if (!time.data.roundEndTime) {
    return <RoundIntermission roundId={roundId} variant="pending" />;
  }

  if (time.data.roundStartTime && !started) {
    return <RoundIntermission roundId={roundId} variant="pending" />;
  }
  if (ended) {
    return <RoundIntermission roundId={roundId} variant={endedVariant} />;
  }

  return <>{children}</>;
}
