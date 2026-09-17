import * as z from 'zod';

import { env } from '@/env';
import { createQueryKeys } from '@/lib/query';

import { readFixture } from './fixtures';
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

export interface RoundTime {
  /** Local receive time: the server sends `time_left` instead of its clock, so no offset is needed. */
  serverTime: Date;
  roundStartTime: Date | null;
  /** `null` until the admin starts the round (`POST /admin/startRound`). */
  roundEndTime: Date | null;
  /** The round the contest timer belongs to; absent in fixtures. */
  round?: number;
}

/**
 * `GET /getTime` (`dto.TimerResponse`, envelope-wrapped). While running,
 * the end is anchored on the server's `time_left` rather than `end_time` so a
 * skewed client clock can't shift the countdown. Once stopped the backend
 * drops `start_time`/`end_time`, so a round that hasn't started and one that
 * already ended both arrive with no times.
 */
export const roundTimeSchema = envelope(
  timerWire.transform((wire): RoundTime => {
    const receivedAt = new Date();
    return {
      serverTime: receivedAt,
      roundStartTime: wire.start_time,
      roundEndTime: wire.is_running
        ? new Date(receivedAt.getTime() + wire.time_left * 1000)
        : wire.end_time,
      round: wire.round,
    };
  })
);

export const timerKeys = createQueryKeys('round-time');

export async function getRoundTime(): Promise<RoundTime> {
  if (env.NEXT_PUBLIC_USE_MOCK_API) return readFixture('time');
  return request({ url: '/getTime', method: 'GET', schema: roundTimeSchema });
}

/** `offset = server_time - Date.now()`, applied once and re-synced periodically (D-timer). */
export function computeClockOffset(serverTime: Date | null): number {
  if (!serverTime) return 0;
  return serverTime.getTime() - Date.now();
}

export function remainingMs(endTime: Date | null, offsetMs: number): number {
  if (!endTime) return 0;
  const now = Date.now() + offsetMs;
  return Math.max(0, endTime.getTime() - now);
}
