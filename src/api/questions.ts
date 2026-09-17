import * as z from 'zod';

import type { Question } from '@/components/rounds/types';
import { env } from '@/env';
import { createQueryKeys } from '@/lib/query';

import { readFixture } from './fixtures';
import { request } from './request';
import type { DashboardQuestionSummary } from './session';
import { envelope, normalizeWire } from './wire';

const stringArray = () =>
  z.union([z.array(z.string()), z.null(), z.undefined()]).transform(value => value ?? []);

const QUESTION_FIELDS = [
  'id',
  'description',
  'title',
  'type',
  'inputFormat',
  'buyIn',
  'reward',
  'points',
  'round',
  'constraints',
  'outputFormat',
  'sampleTestInput',
  'sampleTestOutput',
  'explanation',
] as const;

const questionShape = z.object({
  id: z.string(),
  description: z.string().default(''),
  title: z.string(),
  type: z.union([z.literal('visual'), z.literal('code')]).default('code'),
  inputFormat: stringArray(),
  buyIn: z.coerce.string().default('0'),
  reward: z.coerce.string().default('0'),
  points: z.coerce.number().default(0),
  round: z.coerce.number(),
  constraints: stringArray(),
  outputFormat: stringArray(),
  sampleTestInput: stringArray(),
  sampleTestOutput: stringArray(),
  explanation: stringArray(),
  solved: z.boolean().optional(),
  bought: z.boolean().optional(),
});

/**
 * `dto.QuestionResponse` (`GET /question/round`, `GET /question/:id`) never
 * carries a per-user solved/bought flag — those come only from
 * `dto.DashboardResponse.questions[].attempt_status`, merged in by
 * `mergeAttemptStatus` below.
 */
export const questionSchema = z
  .looseObject({})
  .transform(raw =>
    questionShape.parse(normalizeWire(raw, QUESTION_FIELDS))
  ) satisfies z.ZodType<Question>;

const questionListShape = z
  .union([z.array(z.unknown()), z.null(), z.undefined()])
  .transform(value => value ?? [])
  .pipe(z.array(questionSchema));

export const questionKeys = createQueryKeys('questions');

/**
 * `GET /question/round` (`internal/db/sqlc/question_management.sql.go`) is
 * scoped server-side to `WHERE q.round = u.round_qualified` — there is no
 * request parameter that selects an arbitrary round. Requesting a round the
 * caller isn't currently qualified into (e.g. revisiting an earlier round's
 * menu after progressing) returns the *current* round's questions instead,
 * which the client-side filter below correctly drops rather than showing
 * the wrong round's problems.
 */
export async function getQuestionsByRound(round: number): Promise<Question[]> {
  const questions = env.NEXT_PUBLIC_USE_MOCK_API
    ? await readFixture('questionsByRound', round)
    : await request({
        url: '/question/round',
        method: 'GET',
        schema: envelope(questionListShape),
      });
  return questions.filter(question => question.round === round);
}

/** `GET /question/:id` — participant-facing (JWT + ban check only, not admin-gated). */
export async function getQuestionById(questionId: string): Promise<Question> {
  if (env.NEXT_PUBLIC_USE_MOCK_API) return readFixture('questionById', questionId);
  return request({
    url: `/question/${questionId}`,
    method: 'GET',
    schema: envelope(questionSchema),
  });
}

/**
 * Merges `dto.DashboardResponse.questions[].attempt_status` onto the fuller
 * `GET /question/round` payload so `solved`/`bought` badges reflect real
 * server state instead of being permanently unknown.
 */
export function mergeAttemptStatus(
  questions: Question[],
  summaries: DashboardQuestionSummary[] | undefined
): Question[] {
  if (!summaries || summaries.length === 0) return questions;
  const statusById = new Map(summaries.map(summary => [summary.id, summary.attemptStatus]));
  return questions.map(question => {
    const status = statusById.get(question.id);
    if (!status) return question;
    return { ...question, solved: status === 'answered', bought: status !== 'available' };
  });
}
