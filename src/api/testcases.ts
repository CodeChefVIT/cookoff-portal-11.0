import * as z from 'zod';

import type { Testcase } from '@/components/rounds/types';
import { env } from '@/env';
import { createQueryKeys } from '@/lib/query';

import { readFixture } from './fixtures';
import { request } from './request';
import { envelope, normalizeWire } from './wire';

const TESTCASE_FIELDS = [
  'id',
  'questionId',
  'input',
  'expectedOutput',
  'memory',
  'runtime',
  'hidden',
] as const;

export const testcaseSchema = z.looseObject({}).transform(raw =>
  z
    .object({
      id: z.string(),
      questionId: z.string(),
      input: z.string().default(''),
      expectedOutput: z.string().default(''),
      memory: z.coerce.number().default(0),
      runtime: z.coerce.number().default(0),
      hidden: z.boolean().default(false),
    })
    .parse(normalizeWire(raw, TESTCASE_FIELDS))
) satisfies z.ZodType<Testcase>;

const testcaseListShape = z
  .union([z.array(z.unknown()), z.null(), z.undefined()])
  .transform(value => value ?? [])
  .pipe(z.array(testcaseSchema));

export const testcaseKeys = createQueryKeys('testcases');

/**
 * `GET /question/:id/testcases/public` (`TestcaseController.ListPublic`) —
 * `WHERE hidden = false` is enforced server-side, so this list is
 * inherently the "safe to show" set. Never call
 * `GET /question/:id/testcases` (admin-only, all cases incl. hidden) from
 * R2/R3 — it would leak hidden testcase data.
 */
export async function getPublicTestcases(questionId: string): Promise<Testcase[]> {
  if (env.NEXT_PUBLIC_USE_MOCK_API) return readFixture('publicTestcases', questionId);
  return request({
    url: `/question/${questionId}/testcases/public`,
    method: 'GET',
    schema: envelope(testcaseListShape),
  });
}
