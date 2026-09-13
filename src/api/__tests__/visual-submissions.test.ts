import { describe, expect, it } from 'vitest';

import { getFixtureVisualSolution, readFixture } from '../fixtures';
import { visualSubmissionRequestSchema, visualSubmissionResultSchema } from '../visual-submissions';
import { unwrapEnvelope } from '../wire';

const QUESTION_ID = '11111111-1111-4111-8111-111111111111';
const BLOCK_A = '22222222-2222-4222-8222-222222222222';
const BLOCK_B = '33333333-3333-4333-8333-333333333333';

describe('visualSubmissionRequestSchema', () => {
  it('accepts a valid ordered chain', () => {
    const result = visualSubmissionRequestSchema.safeParse({
      questionId: QUESTION_ID,
      blocks: [BLOCK_A, BLOCK_B],
    });
    expect(result.success).toBe(true);
  });

  it('rejects an empty chain', () => {
    const result = visualSubmissionRequestSchema.safeParse({ questionId: QUESTION_ID, blocks: [] });
    expect(result.success).toBe(false);
  });

  it('rejects a chain that reuses a block id (blocks are used once)', () => {
    const result = visualSubmissionRequestSchema.safeParse({
      questionId: QUESTION_ID,
      blocks: [BLOCK_A, BLOCK_A],
    });
    expect(result.success).toBe(false);
  });

  it('rejects a non-uuid question id', () => {
    const result = visualSubmissionRequestSchema.safeParse({
      questionId: 'not-a-uuid',
      blocks: [BLOCK_A],
    });
    expect(result.success).toBe(false);
  });

  it('rejects a non-uuid block id', () => {
    const result = visualSubmissionRequestSchema.safeParse({
      questionId: QUESTION_ID,
      blocks: ['not-a-uuid'],
    });
    expect(result.success).toBe(false);
  });
});

describe('visualSubmissionResultSchema', () => {
  it('parses camelCase wire fields (portal convention)', () => {
    const parsed = visualSubmissionResultSchema.parse({
      pointsAwarded: 10,
      correct: true,
      alreadyAnswered: false,
    });
    expect(parsed).toEqual({ pointsAwarded: 10, correct: true, alreadyAnswered: false });
  });

  it('parses snake_case wire fields (database convention) through an envelope', () => {
    const envelope = {
      success: true,
      message: 'Visual solution submitted successfully',
      data: { points_awarded: 25 },
    };
    const parsed = visualSubmissionResultSchema.parse(unwrapEnvelope(envelope));
    expect(parsed.pointsAwarded).toBe(25);
  });

  it('derives correct from pointsAwarded when the backend omits the flag (dto/round1.go gap)', () => {
    const solved = visualSubmissionResultSchema.parse({ pointsAwarded: 10 });
    expect(solved.correct).toBe(true);

    const wrong = visualSubmissionResultSchema.parse({ pointsAwarded: 0 });
    expect(wrong.correct).toBe(false);
  });

  it('defaults alreadyAnswered to false when absent', () => {
    const parsed = visualSubmissionResultSchema.parse({ pointsAwarded: 0 });
    expect(parsed.alreadyAnswered).toBe(false);
  });
});

describe('readFixture("submitVisual")', () => {
  const questionId = '0a0a0a0a-1a1a-4a1a-8a1a-0a0a0a0a0a01';

  it('awards points for the exact ordered solution', async () => {
    const solution = getFixtureVisualSolution(questionId);
    expect(solution).toBeDefined();

    const result = await readFixture('submitVisual', { questionId, blocks: solution! });
    expect(result.correct).toBe(true);
    expect(result.pointsAwarded).toBeGreaterThan(0);
  });

  it('rejects a chain in the wrong order', async () => {
    const solution = getFixtureVisualSolution(questionId);
    const wrongOrder = [...solution!].reverse();

    const result = await readFixture('submitVisual', { questionId, blocks: wrongOrder });
    expect(result.correct).toBe(false);
    expect(result.pointsAwarded).toBe(0);
  });

  it('rejects an unknown question id', async () => {
    const result = await readFixture('submitVisual', {
      questionId: '99999999-9999-4999-8999-999999999999',
      blocks: ['22222222-2222-4222-8222-222222222222'],
    });
    expect(result.correct).toBe(false);
    expect(result.pointsAwarded).toBe(0);
  });
});
