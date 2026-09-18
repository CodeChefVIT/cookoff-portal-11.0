import { describe, expect, it } from 'vitest';

import type { Question } from '@/types';

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

describe('questionSchema nullable numeric columns', () => {
  const base = { id: 'q1', title: 'Two Sum', round: 2, points: 10 };

  // `buy_in`/`reward` are nullable numeric columns. Before this was handled,
  // `z.coerce.string()` produced the string "null" and `Number()` gave NaN,
  // which disabled the buy-in gate and rendered "you need NaN more to enter".
  it('reads a null buy_in/reward as "0" rather than "null"', () => {
    const parsed = questionSchema.parse({ ...base, buy_in: null, reward: null });
    expect(parsed).toMatchObject({ buyIn: '0', reward: '0' });
    expect(Number(parsed.buyIn)).toBe(0);
    expect(Number(parsed.reward)).toBe(0);
  });

  it('reads an absent buy_in/reward as "0"', () => {
    const parsed = questionSchema.parse(base);
    expect(parsed).toMatchObject({ buyIn: '0', reward: '0' });
  });

  it('keeps a real numeric buy_in intact', () => {
    expect(questionSchema.parse({ ...base, buy_in: 40, reward: 90 })).toMatchObject({
      buyIn: '40',
      reward: '90',
    });
  });

  it('tolerates a null description', () => {
    expect(questionSchema.parse({ ...base, description: null }).description).toBe('');
  });
});

describe('questionSchema type tolerance', () => {
  const base = { id: 'q1', title: 'Two Sum', round: 1, points: 10 };

  // `dto.QuestionResponse.Type` ships as `type`; the DB column is `q_type` and
  // the backend matches it case-insensitively (LOWER(q_type), EqualFold), so
  // case-variant rows are legal. A bare literal union threw on "Visual" and,
  // via z.array(questionSchema), took the whole round down with it.
  it('accepts case-variant type values', () => {
    expect(questionSchema.parse({ ...base, type: 'Visual' }).type).toBe('visual');
    expect(questionSchema.parse({ ...base, type: 'CODE' }).type).toBe('code');
    expect(questionSchema.parse({ ...base, type: 'visual' }).type).toBe('visual');
  });

  it('falls back to code for an unknown or absent type', () => {
    expect(questionSchema.parse({ ...base, type: 'mystery' }).type).toBe('code');
    expect(questionSchema.parse({ ...base, type: null }).type).toBe('code');
    expect(questionSchema.parse(base).type).toBe('code');
  });
});
