import { describe, expect, it } from 'vitest';

import { isPassed, PASSED_STATUS, submissionRequestSchema } from '../submissions';

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
