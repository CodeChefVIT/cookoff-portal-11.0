import * as z from 'zod';

import { env } from '@/env';
import { createQueryKeys } from '@/lib/query';

import { readFixture } from './fixtures';
import { request } from './request';
import { normalizeWire } from './wire';

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
 * `GET /getTime` — SPEC-ONLY (LLD §2.2), shape corroborated by
 * `cookoff-admin-11.0/src/app/(protected)/timer/page.tsx`. There is no
 * per-round field (L2): the caller supplies which round's window this is,
 * derived from `session.roundQualified`.
 */
export const roundTimeSchema = z
  .looseObject({})
  .transform(raw =>
    roundTimeShape.parse(normalizeWire(raw, ['serverTime', 'roundStartTime', 'roundEndTime']))
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
