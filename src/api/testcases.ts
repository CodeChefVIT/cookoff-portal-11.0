import * as z from 'zod';

import type { Testcase } from '@/components/rounds/types';
import { env } from '@/env';
import { createQueryKeys } from '@/lib/query';

import { readFixture } from './fixtures';
import { request } from './request';
import { normalizeWire } from './wire';

const TESTCASE_FIELDS = [
  'id',
  'questionId',
  'input',
  'expectedOutput',
  'memory',
  'runtime',
  'hidden',
] as const;

const testcaseShape = z.object({
  id: z.string(),
  questionId: z.string(),
  input: z.string().default(''),
  expectedOutput: z.string().default(''),
  memory: z.coerce.number().default(0),
  runtime: z.coerce.number().default(0),
  hidden: z.boolean().default(false),
});

export const testcaseSchema = z
  .looseObject({})
  .transform(raw =>
    testcaseShape.parse(normalizeWire(raw, TESTCASE_FIELDS))
  ) satisfies z.ZodType<Testcase>;

const testcaseListEnvelopeSchema = z.looseObject({ testCases: z.array(z.unknown()).optional() });

export const testcaseKeys = createQueryKeys('testcases');

/**
 * `GET /question/:id/testcases/public` — SPEC-ONLY (LLD §2.2). Never call
 * `GET /question/:id/testcases` (all cases incl. hidden) from R2/R3 — it
 * would leak hidden testcase data that TestcasePanel is required to mask.
 */
export async function getPublicTestcases(questionId: string): Promise<Testcase[]> {
  if (env.NEXT_PUBLIC_USE_MOCK_API) return readFixture('publicTestcases', questionId);
  const raw = await request<unknown>({
    url: `/question/${questionId}/testcases/public`,
    method: 'GET',
  });
  const list = Array.isArray(raw) ? raw : (testcaseListEnvelopeSchema.parse(raw).testCases ?? []);
  return z.array(testcaseSchema).parse(list);
}
