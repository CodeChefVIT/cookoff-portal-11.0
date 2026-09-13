import * as z from 'zod';

import { env } from '@/env';
import { createQueryKeys } from '@/lib/query';

import { readFixture } from './fixtures';
import { request } from './request';
import { envelope, normalizeWire } from './wire';

const isoOrEpoch = z.union([z.string(), z.number()]).transform(value => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
});

const roundTimeShape = z.object({
  serverTime: isoOrEpoch,
  roundStartTime: isoOrEpoch,
  roundEndTime: isoOrEpoch,
});

/**
 * `GET /getTime` does not exist on the backend at all (confirmed against
 * `cookoff-11.0-be/internal/router/router.go`, which now wires every other
 * R2/R3 route) — L2 stands. `RoundGate` fails open on this query's error
 * (qualification alone still gates access); only the timer display
 * degrades to "clock unavailable". Envelope-wrapped for the day this
 * lands, per `dto.SuccessResponse`.
 */
export const roundTimeSchema = envelope(
  z
    .looseObject({})
    .transform(raw =>
      roundTimeShape.parse(normalizeWire(raw, ['serverTime', 'roundStartTime', 'roundEndTime']))
    )
);

export type RoundTime = z.infer<typeof roundTimeShape>;

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
