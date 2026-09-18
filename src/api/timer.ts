import * as z from 'zod';

import { createQueryKeys } from '@/lib/query';

import { request } from './request';
import { envelope } from './wire';

const isoOrNull = z
  .string()
  .nullish()
  .transform(value => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  });

/** `dto.TimerResponse` from `cookoff-11.0-be/internal/helpers/timer`. */
const timerWire = z.object({
  round: z.coerce.number().int(),
  is_running: z.boolean(),
  start_time: isoOrNull,
  end_time: isoOrNull,
  time_left: z.coerce.number().nonnegative(),
});

// `time_left` is whole seconds and ages by the request latency, so an end
// anchored on it drifts by up to ~1s per fetch. When the device clock agrees
// with the server's `end_time` to within this, `end_time` is used as-is.
const CLOCK_AGREEMENT_MS = 3_000;

export interface RoundTime {
  /** Local receive time — countdowns never read a clock older than this. */
  serverTime: Date;
  roundStartTime: Date | null;
  /** `null` until the admin starts the round (`POST /admin/startRound`). */
  roundEndTime: Date | null;
  /** The round the contest timer belongs to. */
  // Optional so hand-built test values can omit it.
  round?: number;
}

/**
 * `GET /getTime` (`dto.TimerResponse`, envelope-wrapped). While running, the
 * end is the server's exact `end_time` when the device clock agrees with it,
 * so every refresh lands on the same countdown; a skewed device clock falls
 * back to anchoring on `time_left` instead. Once stopped the backend
 * drops `start_time`/`end_time`, so a round that hasn't started and one that
 * already ended both arrive with no times.
 */
export const roundTimeSchema = envelope(
  timerWire.transform((wire): RoundTime => {
    const receivedAt = new Date();
    return {
      serverTime: receivedAt,
      roundStartTime: wire.start_time,
      roundEndTime: wire.is_running ? runningEndTime(wire, receivedAt) : wire.end_time,
      round: wire.round,
    };
  })
);

function runningEndTime(
  wire: Pick<z.infer<typeof timerWire>, 'end_time' | 'time_left'>,
  receivedAt: Date
): Date {
  const anchored = new Date(receivedAt.getTime() + wire.time_left * 1000);
  if (!wire.end_time) return anchored;
  const clocksAgree = Math.abs(wire.end_time.getTime() - anchored.getTime()) <= CLOCK_AGREEMENT_MS;
  return clocksAgree ? wire.end_time : anchored;
}

export const timerKeys = createQueryKeys('round-time');

export async function getRoundTime(): Promise<RoundTime> {
  return request({ url: '/getTime', method: 'GET', schema: roundTimeSchema });
}

/** Milliseconds from `nowMs` until `endTime`, clamped at 0. */
export function remainingMs(endTime: Date | null, nowMs: number): number {
  if (!endTime) return 0;
  return Math.max(0, endTime.getTime() - nowMs);
}
