import { describe, expect, it } from 'vitest';

import { questionSchema } from '../questions';

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

  it('leaves bountyActive, solved, and bought undefined when absent (L4)', () => {
    const parsed = questionSchema.parse({ id: 'q5', title: 'No Flags', round: 2 });
    expect(parsed.bountyActive).toBeUndefined();
    expect(parsed.solved).toBeUndefined();
    expect(parsed.bought).toBeUndefined();
  });

  it('throws ApiError-shaped validation error on a malformed payload', () => {
    expect(() => questionSchema.parse({ round: 2 })).toThrow();
  });
});
