import { describe, expect, it } from 'vitest';

import type { Question } from '@/types';

import { getRoundConfig, sortQuestionsForRound } from '../round-config';

function makeQuestion(
  overrides: Partial<Question> & Pick<Question, 'id' | 'title' | 'points'>
): Question {
  return {
    description: '',
    type: 'code',
    inputFormat: [],
    buyIn: '0',
    reward: '0',
    round: 2,
    constraints: [],
    outputFormat: [],
    sampleTestInput: [],
    sampleTestOutput: [],
    explanation: [],
    ...overrides,
  };
}

describe('getRoundConfig', () => {
  it('R1 has no buy-in, no currency, and puts Submit in the header', () => {
    const config = getRoundConfig(1);
    expect(config.engine).toBe('visual');
    expect(config.hasBuyIn).toBe(false);
    expect(config.hasCurrency).toBe(false);
    expect(config.headerSubmit).toBe(true);
    expect(config.chrome).toBe('scratch');
    expect(config.isFinalRound).toBe(false);
  });

  it('R2 requires a buy-in and shows currency', () => {
    const config = getRoundConfig(2);
    expect(config.hasBuyIn).toBe(true);
    expect(config.hasCurrency).toBe(true);
    expect(config.chrome).toBe('code');
    expect(config.isFinalRound).toBe(false);
  });

  it('R3 has no buy-in, no currency, and is the final round', () => {
    const config = getRoundConfig(3);
    expect(config.engine).toBe('code');
    expect(config.hasBuyIn).toBe(false);
    expect(config.hasCurrency).toBe(false);
    expect(config.headerSubmit).toBe(false);
    expect(config.chrome).toBe('code');
    expect(config.isFinalRound).toBe(true);
  });
});

describe('sortQuestionsForRound', () => {
  it('orders by points ascending', () => {
    const questions = [
      makeQuestion({ id: '1', title: 'B', points: 30 }),
      makeQuestion({ id: '2', title: 'A', points: 10 }),
      makeQuestion({ id: '3', title: 'C', points: 20 }),
    ];
    expect(sortQuestionsForRound(questions).map(q => q.id)).toEqual(['2', '3', '1']);
  });

  it('breaks ties by title', () => {
    const questions = [
      makeQuestion({ id: '1', title: 'Zebra', points: 10 }),
      makeQuestion({ id: '2', title: 'Apple', points: 10 }),
    ];
    expect(sortQuestionsForRound(questions).map(q => q.id)).toEqual(['2', '1']);
  });

  it('does not mutate the input array', () => {
    const questions = [
      makeQuestion({ id: '1', title: 'A', points: 20 }),
      makeQuestion({ id: '2', title: 'B', points: 10 }),
    ];
    const original = [...questions];
    sortQuestionsForRound(questions);
    expect(questions).toEqual(original);
  });
});
