import * as z from 'zod';

import { env } from '@/env';
import { createQueryKeys } from '@/lib/query';
import { uuidSchema } from '@/schemas';

import { readFixture } from './fixtures';
import { request } from './request';
import { normalizeWire } from './wire';

/**
 * `/runcode` and `/runcustom` have no documented request/response contract
 * (LLD §2.2 lists the paths only — L8). Gate the UI behind this flag instead
 * of guessing a shape; flip it once the backend publishes the contract.
 */
export const CAPABILITIES = {
  runCode: false,
} as const;

/** Judge0 status ids (LLD §2.6). 1/2 are non-terminal; everything else ends the poll. */
const TERMINAL_JUDGE0_IDS: Record<number, true> = {
  3: true,
  4: true,
  5: true,
  6: true,
  7: true,
  8: true,
  9: true,
  10: true,
  11: true,
  12: true,
  13: true,
  14: true,
};

export function isTerminalStatus(statusId: number | undefined): boolean {
  return statusId !== undefined && TERMINAL_JUDGE0_IDS[statusId] === true;
}

export const JUDGE0_LABELS: Record<number, string> = {
  1: 'In queue',
  2: 'Processing',
  3: 'Accepted',
  4: 'Wrong Answer',
  5: 'Time Limit Exceeded',
  6: 'Compilation Error',
  7: 'Runtime Error (SIGSEGV)',
  8: 'Runtime Error (SIGXFSZ)',
  9: 'Runtime Error (SIGFPE)',
  10: 'Runtime Error (SIGABRT)',
  11: 'Runtime Error (NZEC)',
  12: 'Runtime Error (Other)',
  13: 'Internal Error',
  14: 'Exec Format Error',
};

export const submissionRequestSchema = z.object({
  questionId: uuidSchema,
  languageId: z.number().int().positive(),
  sourceCode: z.string().min(1, 'Write some code before submitting.'),
});

export type SubmissionRequestInput = z.infer<typeof submissionRequestSchema>;

const submitResponseShape = z.object({ submissionId: z.string() });

const testcaseResultShape = z.object({
  testcaseId: z.string().optional(),
  hidden: z.boolean().default(false),
  passed: z.boolean().default(false),
  statusId: z.coerce.number().optional(),
  statusDescription: z.string().optional(),
  runtime: z.coerce.number().optional(),
  memory: z.coerce.number().optional(),
  stdout: z.string().optional(),
});

export type TestcaseResult = z.infer<typeof testcaseResultShape>;

const TESTCASE_RESULT_FIELDS = [
  'testcaseId',
  'hidden',
  'passed',
  'statusId',
  'statusDescription',
  'runtime',
  'memory',
  'stdout',
] as const;

const testcaseResultSchema = z
  .looseObject({})
  .transform(raw => testcaseResultShape.parse(normalizeWire(raw, TESTCASE_RESULT_FIELDS)));

const submissionResultShape = z.object({
  submissionId: z.string(),
  statusId: z.coerce.number().optional(),
  statusDescription: z.string().optional(),
  testcasesPassed: z.coerce.number().default(0),
  testcasesFailed: z.coerce.number().default(0),
  compileOutput: z.string().optional(),
  stderr: z.string().optional(),
  results: z.array(testcaseResultSchema).default([]),
  pointsAwarded: z.coerce.number().default(0),
  alreadyAnswered: z.boolean().default(false),
});

export type SubmissionVerdict = z.infer<typeof submissionResultShape>;

const SUBMISSION_RESULT_FIELDS = [
  'submissionId',
  'statusId',
  'statusDescription',
  'testcasesPassed',
  'testcasesFailed',
  'compileOutput',
  'stderr',
  'results',
  'pointsAwarded',
  'alreadyAnswered',
] as const;

export const submissionResultSchema = z
  .looseObject({})
  .transform(raw => submissionResultShape.parse(normalizeWire(raw, SUBMISSION_RESULT_FIELDS)));

export const submissionKeys = createQueryKeys('submissions');

/** `POST /submit` — SPEC-ONLY (LLD §2.8.1). Never auto-retried (mutations.retry stays 0). */
export async function submitCode(input: SubmissionRequestInput): Promise<{ submissionId: string }> {
  const payload = submissionRequestSchema.parse(input);
  if (env.NEXT_PUBLIC_USE_MOCK_API) return readFixture('submit', payload);
  const raw = await request<unknown>({
    url: '/submit',
    method: 'POST',
    data: {
      question_id: payload.questionId,
      language_id: payload.languageId,
      source_code: payload.sourceCode,
    },
    timeout: 30_000,
  });
  return submitResponseShape.parse(normalizeWire(z.looseObject({}).parse(raw), ['submissionId']));
}

/** `GET /result/:submission_id` — polled by `useCodeSubmission` until terminal. */
export async function getSubmissionResult(submissionId: string): Promise<SubmissionVerdict> {
  if (env.NEXT_PUBLIC_USE_MOCK_API) return readFixture('result', submissionId);
  return request({ url: `/result/${submissionId}`, method: 'GET', schema: submissionResultSchema });
}
