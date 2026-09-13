import * as z from 'zod';

import { env } from '@/env';
import { createQueryKeys } from '@/lib/query';

import { api } from './client';
import { readFixture } from './fixtures';
import { request } from './request';
import { normalizeWire, pickField, unwrapEnvelope, type WireRecord } from './wire';

const attemptStatusSchema = z.enum(['available', 'bought', 'answered']);
export type AttemptStatus = z.infer<typeof attemptStatusSchema>;

/** `questions[{id, attempt_status}]` → `{ [questionId]: status }`; malformed entries are skipped. */
function readAttemptStatuses(value: unknown): Record<string, AttemptStatus> {
  if (!Array.isArray(value)) return {};
  const statuses: Record<string, AttemptStatus> = {};
  for (const item of value) {
    if (typeof item !== 'object' || item === null) continue;
    const id = pickField(item as WireRecord, 'id');
    const status = attemptStatusSchema.safeParse(pickField(item as WireRecord, 'attemptStatus'));
    if (typeof id === 'string' && status.success) statuses[id] = status.data;
  }
  return statuses;
}

/**
 * `GET /dashboard` — `dto.DashboardResponse` inside the `{success,message,data}`
 * envelope. Doubles as the session probe (L12), and its
 * `questions[].attempt_status` is the only per-user solved/bought source (L4).
 * `balance`/`score` arrive as numeric strings.
 */
export const sessionSchema = z.preprocess(
  unwrapEnvelope,
  z
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
        'questions',
      ]);
      return {
        userId: z.string().parse(wire.userId ?? pickField(raw, 'id') ?? ''),
        email: z.string().parse(wire.email ?? ''),
        balance: z.coerce.number().parse(wire.balance ?? 0),
        score: z.coerce.number().parse(wire.score ?? 0),
        roundQualified: z.coerce
          .number()
          .int()
          .min(0)
          .parse(wire.roundQualified ?? 0),
        isBanned: z.coerce.boolean().parse(wire.isBanned ?? false),
        attemptStatuses: readAttemptStatuses(wire.questions),
      };
    })
);

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
