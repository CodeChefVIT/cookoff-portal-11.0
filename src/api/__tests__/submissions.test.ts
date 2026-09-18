import { describe, expect, it } from 'vitest';

import {
  isPassed,
  PASSED_STATUS,
  submissionRequestSchema,
  submissionResultSchema,
} from '../submissions';

/** `dto.ResultResponse` exactly as `internal/controllers/result.go` marshals it. */
const judgedVerdict = {
  id: 'sub-1',
  question_id: 'q-1',
  passed: 2,
  failed: 1,
  runtime: 0.012,
  memory: 2048,
  submission_time: '2026-09-18 03:14:43',
  description: '2/3 testcases passed (Wrong Answer)',
  testcases: [
    { id: 'tc-1', runtime: 0.011, memory: 2048, status: 'Success', description: '' },
    { id: 'tc-2', runtime: 0.012, memory: 2048, status: 'Wrong Answer', description: '' },
  ],
};

describe('submissionResultSchema', () => {
  it('maps each testcase’s wire `id` onto `testcaseId`', () => {
    const parsed = submissionResultSchema.parse(judgedVerdict);
    expect(parsed.testcases.map(testcase => testcase.testcaseId)).toEqual(['tc-1', 'tc-2']);
  });

  it('maps the submission’s wire `id` onto `submissionId`', () => {
    expect(submissionResultSchema.parse(judgedVerdict)).toMatchObject({
      submissionId: 'sub-1',
      questionId: 'q-1',
      passed: 2,
      failed: 1,
    });
  });

  it('keeps `isPassed` usable against the parsed testcases', () => {
    const parsed = submissionResultSchema.parse(judgedVerdict);
    expect(parsed.testcases.filter(isPassed)).toHaveLength(1);
  });

  it('treats a nil `Testcases` slice (marshalled as null) as empty', () => {
    const parsed = submissionResultSchema.parse({ ...judgedVerdict, testcases: null });
    expect(parsed.testcases).toEqual([]);
  });

  it('treats an absent `testcases` key as empty', () => {
    const withoutTestcases: Record<string, unknown> = { ...judgedVerdict };
    delete withoutTestcases.testcases;
    expect(submissionResultSchema.parse(withoutTestcases).testcases).toEqual([]);
  });

  it('accepts an empty testcase list', () => {
    expect(submissionResultSchema.parse({ ...judgedVerdict, testcases: [] }).testcases).toEqual([]);
  });
});

describe('isPassed', () => {
  it('is true only for the Judge0 "Success" status string', () => {
    expect(isPassed({ status: 'Success' })).toBe(true);
    expect(isPassed({ status: PASSED_STATUS })).toBe(true);
  });

  it('is false for any other status', () => {
    expect(isPassed({ status: 'Wrong Answer' })).toBe(false);
    expect(isPassed({ status: 'Time Limit Exceeded' })).toBe(false);
    expect(isPassed({ status: 'Compilation Error' })).toBe(false);
  });
});

describe('submissionRequestSchema', () => {
  it('accepts a valid submission', () => {
    const result = submissionRequestSchema.safeParse({
      questionId: '11111111-1111-4111-8111-111111111111',
      languageId: 54,
      sourceCode: 'int main() {}',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty source code', () => {
    const result = submissionRequestSchema.safeParse({
      questionId: '11111111-1111-4111-8111-111111111111',
      languageId: 54,
      sourceCode: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a non-uuid question id', () => {
    const result = submissionRequestSchema.safeParse({
      questionId: 'not-a-uuid',
      languageId: 54,
      sourceCode: 'int main() {}',
    });
    expect(result.success).toBe(false);
  });
});
