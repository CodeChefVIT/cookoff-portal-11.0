import { describe, expect, it } from 'vitest';

import { isTerminalStatus, JUDGE0_LABELS, submissionRequestSchema } from '../submissions';

describe('isTerminalStatus', () => {
  it('is not terminal for in-queue (1) or processing (2)', () => {
    expect(isTerminalStatus(1)).toBe(false);
    expect(isTerminalStatus(2)).toBe(false);
  });

  it('is terminal for every id 3 through 14', () => {
    for (let id = 3; id <= 14; id++) {
      expect(isTerminalStatus(id)).toBe(true);
    }
  });

  it('is not terminal for undefined', () => {
    expect(isTerminalStatus(undefined)).toBe(false);
  });
});

describe('JUDGE0_LABELS', () => {
  it('has a human label for every terminal status id', () => {
    for (let id = 1; id <= 14; id++) {
      expect(JUDGE0_LABELS[id]).toBeTruthy();
    }
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
