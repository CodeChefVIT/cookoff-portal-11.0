import * as z from 'zod';

import type { Question } from '@/components/rounds/types';
import { env } from '@/env';
import { createQueryKeys } from '@/lib/query';

import { readFixture } from './fixtures';
import { request } from './request';
import { normalizeWire } from './wire';

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
  'bountyActive',
  'solved',
  'bought',
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
  bountyActive: z.boolean().optional(),
  solved: z.boolean().optional(),
  bought: z.boolean().optional(),
});

export const questionSchema = z
  .looseObject({})
  .transform(raw =>
    questionShape.parse(normalizeWire(raw, QUESTION_FIELDS))
  ) satisfies z.ZodType<Question>;

export const questionListSchema = z
  .union([z.array(z.unknown()), z.null(), z.undefined()])
  .transform(value => value ?? [])
  .pipe(z.array(questionSchema));

export const questionKeys = createQueryKeys('questions');

/**
 * `GET /question/round` — SPEC-ONLY (LLD §2.2). The round is filtered
 * server-side per the LLD, but we defensively re-filter by `round` since the
 * response shape (and whether it already scopes by the caller's
 * `round_qualified`) is undocumented.
 */
export async function getQuestionsByRound(round: number): Promise<Question[]> {
  const questions = env.NEXT_PUBLIC_USE_MOCK_API
    ? await readFixture('questionsByRound', round)
    : await request({
        url: '/question/round',
        method: 'GET',
        schema: questionListSchema,
      });
  return questions.filter(question => question.round === round);
}
