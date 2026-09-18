import * as z from 'zod';

import { env } from '@/env';
import { createQueryKeys } from '@/lib/query';
import { uuidSchema } from '@/schemas';

import type { CustomRunResult } from './fixtures';
import { readFixture } from './fixtures';
import { request } from './request';
import { envelope, normalizeWire } from './wire';

export type { CustomRunResult };

/**
 * `/runcode` and `/runcustom` are wired in `internal/controllers/runcode.go`
 * returning `dto.SuccessResponse` wrapped Judge0 payloads.
 */
export const CAPABILITIES = {
  runCode: true,
} as const;

/** `dto.Judge0StatusMap`'s success string (`internal/helpers/utils/const.go`) — the only status value that means "passed". */
export const PASSED_STATUS = 'Success';

export const submissionRequestSchema = z.object({
  questionId: uuidSchema,
  languageId: z.number().int().positive(),
  sourceCode: z.string().min(1, 'Write some code before submitting.'),
});

export type SubmissionRequestInput = z.infer<typeof submissionRequestSchema>;

export const customRunRequestSchema = z.object({
  languageId: z.number().int().positive(),
  sourceCode: z.string().min(1, 'Write some code before running.'),
  stdin: z.string().default(''),
});

export type CustomRunRequestInput = z.infer<typeof customRunRequestSchema>;

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
  testcases: z.array(
    z
      .looseObject({})
      .transform(raw => testcaseResultShape.parse(normalizeWire(raw, TESTCASE_RESULT_FIELDS)))
  ),
});

export type SubmissionVerdict = z.infer<typeof submissionResultShape>;

const resultShape = z.looseObject({}).transform(raw => {
  const wire = normalizeWire(raw, SUBMISSION_RESULT_FIELDS);
  return submissionResultShape.parse({ ...wire, submissionId: wire.id });
});

const judge0StatusShape = z.object({
  id: z.number(),
  description: z.string(),
});

export const judge0CallbackPayloadShape = z.object({
  token: z.string().optional(),
  stdout: z.string().nullable().optional(),
  stderr: z.string().nullable().optional(),
  message: z.string().nullable().optional(),
  time: z.string().nullable().optional(),
  memory: z.number().nullable().optional(),
  status: judge0StatusShape.default({ id: 0, description: 'Unknown' }),
});

export type Judge0CallbackPayload = z.infer<typeof judge0CallbackPayloadShape>;

export const submissionKeys = createQueryKeys('submissions');

/**
 * `POST /submit` (`internal/controllers/submission.go#SubmitCode`).
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
 * terminal result directly.
 */
export async function getSubmissionResult(submissionId: string): Promise<SubmissionVerdict> {
  if (env.NEXT_PUBLIC_USE_MOCK_API) return readFixture('result', submissionId);
  return request({
    url: `/result/${submissionId}`,
    method: 'GET',
    schema: envelope(resultShape),
    timeout: 130_000,
  });
}

/**
 * `POST /runcode` (`internal/controllers/runcode.go#RunCode`)
 * Runs code against the question's public testcases concurrently and returns
 * a normalized `SubmissionVerdict` for presentation in `TestcasePanel`.
 */
export async function runCode(
  input: SubmissionRequestInput,
  publicTestcases: { id: string }[] = []
): Promise<SubmissionVerdict> {
  const payload = submissionRequestSchema.parse(input);
  if (env.NEXT_PUBLIC_USE_MOCK_API) return readFixture('runCode', payload);

  const results = await request({
    url: '/runcode',
    method: 'POST',
    data: {
      question_id: payload.questionId,
      language_id: payload.languageId,
      source_code: payload.sourceCode,
    },
    schema: envelope(z.array(judge0CallbackPayloadShape)),
    timeout: 30_000,
  });

  const passed = results.filter(r => r.status.id === 3).length;
  const failed = results.length - passed;
  const allPassed = passed === results.length && results.length > 0;

  const testcases: TestcaseResult[] = results.map((r, index) => {
    const isPass = r.status.id === 3;
    const testcaseId = publicTestcases[index]?.id ?? `public-case-${index + 1}`;
    const outputDesc =
      r.stderr || r.message || (isPass ? '' : r.status.description || 'Wrong Answer');
    return {
      testcaseId,
      runtime: r.time ? parseFloat(r.time) * 1000 : undefined,
      memory: r.memory ?? undefined,
      status: isPass ? PASSED_STATUS : r.status.description || 'Failed',
      description: outputDesc,
    };
  });

  return {
    submissionId: `run-${Date.now()}`,
    questionId: payload.questionId,
    passed,
    failed,
    submissionTime: new Date().toISOString(),
    description: allPassed
      ? 'All sample testcases passed'
      : `${passed}/${results.length} testcases passed`,
    testcases,
  };
}

/**
 * `POST /runcustom` (`internal/controllers/runcode.go#RunCustom`)
 * Runs code against custom stdin.
 */
export async function runCustom(input: CustomRunRequestInput): Promise<CustomRunResult> {
  const payload = customRunRequestSchema.parse(input);
  if (env.NEXT_PUBLIC_USE_MOCK_API) return readFixture('runCustom', payload);

  const raw = await request({
    url: '/runcustom',
    method: 'POST',
    data: {
      source_code: payload.sourceCode,
      language_id: payload.languageId,
      stdin: payload.stdin,
    },
    schema: envelope(judge0CallbackPayloadShape),
    timeout: 30_000,
  });

  return {
    stdout: raw.stdout ?? null,
    stderr: raw.stderr ?? null,
    message: raw.message ?? null,
    time: raw.time ?? undefined,
    memory: raw.memory ?? undefined,
    status: raw.status,
    isPassed: raw.status.id === 3,
  };
}
