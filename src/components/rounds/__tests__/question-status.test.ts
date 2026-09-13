import { describe, expect, it } from 'vitest';

import { withAttemptStatuses } from '../question-status';
import type { Question } from '../types';

function makeQuestion(id: string, overrides: Partial<Question> = {}): Question {
  return {
    id,
    title: id,
    description: '',
    type: 'visual',
    inputFormat: [],
    buyIn: '0',
    reward: '0',
    points: 10,
    round: 1,
    constraints: [],
    outputFormat: [],
    sampleTestInput: [],
    sampleTestOutput: [],
    explanation: [],
    ...overrides,
  };
}

describe('withAttemptStatuses', () => {
  it('maps answered → solved + bought, bought → bought, available → neither', () => {
    const [answered, bought, available] = withAttemptStatuses(
      [makeQuestion('a'), makeQuestion('b'), makeQuestion('c')],
      { a: 'answered', b: 'bought', c: 'available' }
    );
    expect(answered).toMatchObject({ solved: true, bought: true });
    expect(bought).toMatchObject({ solved: false, bought: true });
    expect(available).toMatchObject({ solved: false, bought: false });
  });

  it('leaves questions the dashboard does not list untouched', () => {
    const question = makeQuestion('x', { bought: true });
    expect(withAttemptStatuses([question], { other: 'answered' })[0]).toBe(question);
  });

  it('returns the list as-is while the session is still loading', () => {
    const questions = [makeQuestion('a')];
    expect(withAttemptStatuses(questions, undefined)).toBe(questions);
  });
});
