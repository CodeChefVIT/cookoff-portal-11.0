import * as z from 'zod';

import { env } from '@/env';
import { createQueryKeys } from '@/lib/query';

import { api } from './client';
import { readFixture } from './fixtures';
import { request } from './request';
import { normalizeWire } from './wire';

/**
 * `GET /dashboard` — SPEC-ONLY (LLD §2.2). No response shape is documented;
 * this schema covers exactly the fields R2/R3 actually need (balance, score,
 * round_qualified) and is tolerant of camel/Pascal/snake casing (C6).
 */
export const sessionSchema = z
  .object({})
  .loose()
  .transform(raw => {
    const wire = normalizeWire(raw, [
      'userId',
      'email',
      'balance',
      'score',
      'roundQualified',
      'isBanned',
    ]);
    return {
      userId: z.string().parse(wire.userId ?? ''),
      email: z.string().parse(wire.email ?? ''),
      balance: z.coerce.number().parse(wire.balance ?? 0),
      score: z.coerce.number().parse(wire.score ?? 0),
      roundQualified: z.coerce
        .number()
        .int()
        .min(0)
        .parse(wire.roundQualified ?? 0),
      isBanned: z.coerce.boolean().parse(wire.isBanned ?? false),
    };
  });

export type Session = z.infer<typeof sessionSchema>;

export const sessionKeys = createQueryKeys('session');

export async function getSession(): Promise<Session> {
  if (env.NEXT_PUBLIC_USE_MOCK_API) return readFixture('session');
  return request({ url: '/dashboard', method: 'GET', schema: sessionSchema });
}

export async function logout(): Promise<void> {
  if (env.NEXT_PUBLIC_USE_MOCK_API) return;
  await api.post('/logout', {});
}
