import * as z from 'zod';

import { env } from '@/env';
import { createQueryKeys } from '@/lib/query';
import { uuidSchema } from '@/schemas';

import { readFixture } from './fixtures';
import { request } from './request';
import { envelope, normalizeWire } from './wire';

/**
 * `/runcode` and `/runcustom` are wired (`RunCode`/`RunCustom` in
 * `internal/controllers/runcode.go`) but return a raw array of Judge0
 * callback payloads with no `dto.SuccessResponse` envelope and no persisted
 * submission id — a materially different contract from `/submit` +
 * `/result/:id`. Gated behind this flag until that shape is normalised;
 * "Run Code" stays visibly disabled with an explanation until then.
 */
export const CAPABILITIES = {
  runCode: false,
} as const;

/** `dto.Judge0StatusMap`'s success string (`internal/helpers/utils/const.go`) — the only status value that means "passed". */
export const PASSED_STATUS = 'Success';

export const submissionRequestSchema = z.object({
  questionId: uuidSchema,
  languageId: z.number().int().positive(),
  sourceCode: z.string().min(1, 'Write some code before submitting.'),
});

export type SubmissionRequestInput = z.infer<typeof submissionRequestSchema>;

const submitResponseShape = z.object({ submissionId: z.string() });

const TESTCASE_RESULT_FIELDS = ['id', 'runtime', 'memory', 'status', 'description'] as const;

const testcaseResultShape = z.object({
  testcaseId: z.string(),
  runtime: z.coerce.number().optional(),
  memory: z.coerce.number().optional(),
  status: z.string(),
  description: z.string().default(''),
});

export type TestcaseResult = z.infer<typeof testcaseResultShape>;

export function isPassed(result: Pick<TestcaseResult, 'status'>): boolean {
  return result.status === PASSED_STATUS;
}

const SUBMISSION_RESULT_FIELDS = [
  'id',
  'questionId',
  'passed',
  'failed',
  'runtime',
  'memory',
  'submissionTime',
  'description',
  'testcases',
] as const;

const submissionResultShape = z.object({
  submissionId: z.string(),
  questionId: z.string(),
  passed: z.coerce.number().default(0),
  failed: z.coerce.number().default(0),
  runtime: z.coerce.number().optional(),
  memory: z.coerce.number().optional(),
  submissionTime: z.string().optional(),
  /** Overall verdict, e.g. "All 3 testcases passed" or "2/3 testcases passed (Wrong Answer)". */
  description: z.string().default(''),
  /**
   * `dto.TestcaseResult.ID` is the *testcase* id and ships as `id`
   * (`internal/dto/result.go:4`), so it needs the same remap the submission
   * level does for `submissionId` below. A nil `Testcases` slice marshals to
   * `null`, hence the same null-tolerance every other list schema uses.
   */
  testcases: z
    .union([z.array(z.unknown()), z.null(), z.undefined()])
    .transform(value => value ?? [])
    .pipe(
      z.array(
        z.looseObject({}).transform(raw => {
          const wire = normalizeWire(raw, TESTCASE_RESULT_FIELDS);
          return testcaseResultShape.parse({ ...wire, testcaseId: wire.id });
        })
      )
    ),
});

export type SubmissionVerdict = z.infer<typeof submissionResultShape>;

/**
 * Exported so the wire contract is unit-testable without mocking axios — the
 * `/result/:id` shape is the one layer `QuestionWorkspace.test.tsx` bypasses
 * (it mocks `getSubmissionResult` wholesale), which is how the missing
 * `testcaseId` remap survived.
 */
export const submissionResultSchema = z.looseObject({}).transform(raw => {
  const wire = normalizeWire(raw, SUBMISSION_RESULT_FIELDS);
  return submissionResultShape.parse({ ...wire, submissionId: wire.id });
});

export const submissionKeys = createQueryKeys('submissions');

/**
 * `POST /submit` (`internal/controllers/submission.go#SubmitCode`). Notably
 * does **not** check attempt/purchase status before enqueueing Judge0 — a
 * `402/403 "not purchased"` response is defensive handling for a contract
 * the LLD describes but the current implementation doesn't enforce
 * synchronously (buy-in accounting instead happens at result-finalize time
 * via `EnsureAttempt`). Never auto-retried (mutations.retry stays 0).
 */
export async function submitCode(input: SubmissionRequestInput): Promise<{ submissionId: string }> {
  const payload = submissionRequestSchema.parse(input);
  if (env.NEXT_PUBLIC_USE_MOCK_API) return readFixture('submit', payload);
  return request({
    url: '/submit',
    method: 'POST',
    data: {
      question_id: payload.questionId,
      language_id: payload.languageId,
      source_code: payload.sourceCode,
    },
    schema: envelope(
      z
        .looseObject({})
        .transform(raw => submitResponseShape.parse(normalizeWire(raw, ['submissionId'])))
    ),
    timeout: 30_000,
  });
}

/**
 * `GET /result/:submission_id` (`internal/controllers/result.go#GetResult`)
 * long-polls **server-side** for up to 2 minutes and returns the final,
 * terminal result directly — there is no Judge0 numeric status id in the
 * response, and no client-side polling loop is needed. A `408` means the
 * submission still hadn't finished after 2 minutes; the caller offers a
 * manual "Check again" instead of hammering the endpoint.
 */
export async function getSubmissionResult(
  submissionId: string,
  signal?: AbortSignal
): Promise<SubmissionVerdict> {
  if (env.NEXT_PUBLIC_USE_MOCK_API) return readFixture('result', submissionId);
  return request({
    url: `/result/${submissionId}`,
    method: 'GET',
    schema: envelope(submissionResultSchema),
    timeout: 130_000,
    signal,
  });
}
