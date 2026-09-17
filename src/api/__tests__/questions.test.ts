import { describe, expect, it } from 'vitest';

import type { Question } from '@/components/rounds/types';

import { mergeAttemptStatus, questionSchema } from '../questions';

describe('questionSchema', () => {
  it('parses camelCase wire fields (portal convention)', () => {
    const parsed = questionSchema.parse({
      id: 'q1',
      title: 'Two Sum',
      description: 'desc',
      round: 2,
      points: 10,
      buyIn: 20,
      reward: 50,
      inputFormat: ['line 1'],
      constraints: ['n <= 10'],
      outputFormat: ['out'],
      sampleTestInput: ['1'],
      sampleTestOutput: ['1'],
      explanation: ['echo'],
    });
    expect(parsed).toMatchObject({ id: 'q1', title: 'Two Sum', round: 2, points: 10, buyIn: '20' });
  });

  it('parses PascalCase wire fields (admin-observed convention, C6)', () => {
    const parsed = questionSchema.parse({
      Id: 'q2',
      Title: 'Reverse String',
      Round: 3,
      Points: 25,
    });
    expect(parsed).toMatchObject({ id: 'q2', title: 'Reverse String', round: 3, points: 25 });
  });

  it('parses snake_case wire fields (database convention)', () => {
    const parsed = questionSchema.parse({
      id: 'q3',
      title: 'Fizzbuzz',
      round: 2,
      input_format: ['line'],
    });
    expect(parsed.inputFormat).toEqual(['line']);
  });

  it('defaults a null array field to an empty array instead of throwing', () => {
    const parsed = questionSchema.parse({
      id: 'q4',
      title: 'Null Constraints',
      round: 2,
      constraints: null,
    });
    expect(parsed.constraints).toEqual([]);
  });

  it('leaves solved and bought undefined when absent (L4)', () => {
    const parsed = questionSchema.parse({ id: 'q5', title: 'No Flags', round: 2 });
    expect(parsed.solved).toBeUndefined();
    expect(parsed.bought).toBeUndefined();
  });

  it('throws ApiError-shaped validation error on a malformed payload', () => {
    expect(() => questionSchema.parse({ round: 2 })).toThrow();
  });
});

describe('mergeAttemptStatus', () => {
  const base = questionSchema.parse({ id: 'q0', title: 'T', round: 1 });
  const make = (id: string, overrides: Partial<Question> = {}): Question => ({
    ...base,
    id,
    ...overrides,
  });

  it('maps answered → solved + bought, bought → bought, available → neither', () => {
    const [answered, bought, available] = mergeAttemptStatus(
      [make('a'), make('b'), make('c')],
      [
        { id: 'a', title: 'A', points: 10, round: 1, attemptStatus: 'answered' },
        { id: 'b', title: 'B', points: 10, round: 1, attemptStatus: 'bought' },
        { id: 'c', title: 'C', points: 10, round: 1, attemptStatus: 'available' },
      ]
    );
    expect(answered).toMatchObject({ solved: true, bought: true });
    expect(bought).toMatchObject({ solved: false, bought: true });
    expect(available).toMatchObject({ solved: false, bought: false });
  });

  it('leaves questions the dashboard does not list untouched', () => {
    const question = make('x', { bought: true });
    expect(
      mergeAttemptStatus(
        [question],
        [{ id: 'other', title: 'O', points: 1, round: 1, attemptStatus: 'answered' }]
      )[0]
    ).toBe(question);
  });

  it('returns the list as-is while the session is still loading', () => {
    const questions = [make('a')];
    expect(mergeAttemptStatus(questions, undefined)).toBe(questions);
  });
});
