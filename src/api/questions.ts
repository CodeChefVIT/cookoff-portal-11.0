import * as z from 'zod';

import { createQueryKeys } from '@/lib/query';
import type { Question } from '@/types';

import { request } from './request';
import type { DashboardQuestionSummary } from './session';
import { envelope, normalizeWire } from './wire';

const stringArray = () =>
  z.union([z.array(z.string()), z.null(), z.undefined()]).transform(value => value ?? []);

/**
 * `questions.buy_in`/`reward` are nullable `numeric` columns, and `.default()`
 * only fires for `undefined` — `z.coerce.string()` would turn a SQL NULL into
 * the *string* `"null"`, which `Number()` then reads as `NaN`. That NaN
 * silently disables the buy-in gate's affordability check and renders
 * "you need NaN more to enter", with no way out of the question.
 */
const numericString = (fallback: string) =>
  z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .transform(value => (value === null || value === undefined ? fallback : String(value)));

/** Nullable in principle (`text` columns are NOT NULL today) — tolerate it anyway. */
const nullableString = (fallback: string) =>
  z
    .union([z.string(), z.null(), z.undefined()])
    .transform(value => (value === null || value === undefined ? fallback : value));

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
  description: nullableString(''),
  title: z.string(),
  /**
   * The backend compares `q_type` case-insensitively everywhere
   * (`LOWER(q_type) = 'visual'`, `strings.EqualFold`), so case-variant data is
   * expected. A bare literal union threw on `"Visual"` and took the whole
   * question — and, through `z.array(questionSchema)`, the whole round — down.
   */
  type: z
    .union([z.string(), z.null(), z.undefined()])
    .transform(value => (value ?? '').toLowerCase())
    .pipe(z.union([z.literal('visual'), z.literal('code')]).catch('code')),
  inputFormat: stringArray(),
  buyIn: numericString('0'),
  reward: numericString('0'),
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
  const questions = await request({
    url: '/question/round',
    method: 'GET',
    schema: envelope(questionListShape),
  });
  return questions.filter(question => question.round === round);
}

/** `GET /question/:id` — participant-facing (JWT + ban check only, not admin-gated). */
export async function getQuestionById(questionId: string): Promise<Question> {
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
