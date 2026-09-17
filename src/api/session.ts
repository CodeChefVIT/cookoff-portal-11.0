import * as z from 'zod';

import { SESSION_TIMEOUT_MS } from '@/constants';
import { env } from '@/env';
import { createQueryKeys } from '@/lib/query';

import { api } from './client';
import { readFixture } from './fixtures';
import { request } from './request';
import { envelope, normalizeWire } from './wire';

const DASHBOARD_QUESTION_FIELDS = ['id', 'title', 'points', 'round', 'attemptStatus'] as const;

/** One row of `DashboardResponse.questions` — the current round only (server-scoped by round_qualified). */
const dashboardQuestionShape = z.object({
  id: z.string(),
  title: z.string(),
  points: z.coerce.number(),
  round: z.coerce.number(),
  attemptStatus: z.union([z.literal('available'), z.literal('bought'), z.literal('answered')]),
});

export type DashboardQuestionSummary = z.infer<typeof dashboardQuestionShape>;

function parseDashboardQuestions(raw: unknown): DashboardQuestionSummary[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(row =>
    dashboardQuestionShape.parse(
      normalizeWire(row as Record<string, unknown>, DASHBOARD_QUESTION_FIELDS)
    )
  );
}

const DASHBOARD_FIELDS = [
  'id',
  'name',
  'email',
  'balance',
  'score',
  'roundQualified',
  'questions',
] as const;

const sessionShape = z.object({
  userId: z.string(),
  /** Google display name — optional so a DTO without it still parses. */
  name: z.string().optional(),
  email: z.string(),
  balance: z.coerce.number(),
  score: z.coerce.number(),
  roundQualified: z.coerce.number().int().min(0),
  /** Current-round questions with this user's per-question attempt status (dto.DashboardResponse.questions). */
  questions: z.array(dashboardQuestionShape),
});

/**
 * `GET /dashboard` (`internal/controllers/dashboard.go`). No `is_banned`
 * field is returned here — a banned user is rejected by `BanCheckUser`
 * middleware before this handler runs, so the frontend never needs to
 * branch on it directly.
 */
export const sessionSchema = envelope(
  z.looseObject({}).transform(raw => {
    const wire = normalizeWire(raw, DASHBOARD_FIELDS);
    return sessionShape.parse({
      userId: wire.id,
      name: wire.name ?? undefined,
      email: wire.email,
      balance: wire.balance,
      score: wire.score,
      roundQualified: wire.roundQualified,
      questions: parseDashboardQuestions(wire.questions),
    });
  })
);

export type Session = z.infer<typeof sessionShape>;

export const sessionKeys = createQueryKeys('session');

export async function getSession(): Promise<Session> {
  if (env.NEXT_PUBLIC_USE_MOCK_API) return readFixture('session');
  return request({
    url: '/dashboard',
    method: 'GET',
    schema: sessionSchema,
    timeout: SESSION_TIMEOUT_MS,
  });
}

export async function logout(): Promise<void> {
  if (env.NEXT_PUBLIC_USE_MOCK_API) return;
  await api.post('/logout', {});
}
