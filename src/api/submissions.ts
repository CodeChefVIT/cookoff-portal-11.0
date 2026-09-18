import * as z from 'zod';

import { createQueryKeys } from '@/lib/query';
import { uuidSchema } from '@/schemas';

import { request } from './request';
import { envelope, normalizeWire } from './wire';

/** What `/runcustom` ran and printed, shaped for the custom-input panel. */
export interface CustomRunResult {
  stdout: string | null;
  stderr: string | null;
  message: string | null;
  time?: string;
  memory?: number;
  status: { id: number; description: string };
  isPassed: boolean;
}

export const CAPABILITIES = {
  runCode: true,
} as const;

export const PASSED_STATUS = 'Success';

/**
 * `/runcode` and `/runcustom` wait for Judge0 synchronously; the server allows
 * them 45s (`runWriteDeadline`, `controllers/runcode.go`), so give it a little
 * more before giving up.
 */
const RUN_TIMEOUT_MS = 50_000;

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

const TESTCASE_RESULT_FIELDS = [
  'id',
  'runtime',
  'memory',
  'status',
  'description',
  'stdout',
] as const;

const testcaseResultShape = z.object({
  testcaseId: z.string(),
  runtime: z.coerce.number().optional(),
  memory: z.coerce.number().optional(),
  status: z.string(),
  description: z.string().default(''),
  /** What the participant's program printed. Only `/runcode` returns it today. */
  stdout: z.string().nullable().optional(),
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
  description: z.string().default(''),
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

export const submissionResultSchema = z.looseObject({}).transform(raw => {
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

export async function submitCode(input: SubmissionRequestInput): Promise<{ submissionId: string }> {
  const payload = submissionRequestSchema.parse(input);
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

export async function getSubmissionResult(
  submissionId: string,
  signal?: AbortSignal
): Promise<SubmissionVerdict> {
  return request({
    url: `/result/${submissionId}`,
    method: 'GET',
    schema: envelope(submissionResultSchema),
    timeout: 130_000,
    signal,
  });
}

export async function runCode(
  input: SubmissionRequestInput,
  publicTestcases: { id: string }[] = []
): Promise<SubmissionVerdict> {
  const payload = submissionRequestSchema.parse(input);

  const results = await request({
    url: '/runcode',
    method: 'POST',
    data: {
      question_id: payload.questionId,
      language_id: payload.languageId,
      source_code: payload.sourceCode,
    },
    schema: envelope(z.array(judge0CallbackPayloadShape)),
    timeout: RUN_TIMEOUT_MS,
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
      stdout: r.stdout ?? null,
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

export async function runCustom(input: CustomRunRequestInput): Promise<CustomRunResult> {
  const payload = customRunRequestSchema.parse(input);

  const raw = await request({
    url: '/runcustom',
    method: 'POST',
    data: {
      source_code: payload.sourceCode,
      language_id: payload.languageId,
      stdin: payload.stdin,
    },
    schema: envelope(judge0CallbackPayloadShape),
    timeout: RUN_TIMEOUT_MS,
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
