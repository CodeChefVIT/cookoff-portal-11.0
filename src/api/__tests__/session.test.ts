import { describe, expect, it } from 'vitest';

import { sessionSchema } from '../session';

describe('sessionSchema', () => {
  it('unwraps the /dashboard envelope and maps dto.DashboardResponse', () => {
    const parsed = sessionSchema.parse({
      success: true,
      message: 'Dashboard retrieved',
      data: {
        id: 'u1',
        name: 'Ada',
        email: 'ada@vitstudent.ac.in',
        balance: '120.5',
        score: '40',
        round_qualified: 1,
        questions: [
          { id: 'q1', title: 'A', points: 10, round: 1, attempt_status: 'answered' },
          { id: 'q2', title: 'B', points: 15, round: 1, attempt_status: 'available' },
        ],
        attempt_totals: { available: 1, bought: 0, answered: 1 },
      },
    });

    expect(parsed).toEqual({
      userId: 'u1',
      email: 'ada@vitstudent.ac.in',
      balance: 120.5,
      score: 40,
      roundQualified: 1,
      questions: [
        { id: 'q1', title: 'A', points: 10, round: 1, attemptStatus: 'answered' },
        { id: 'q2', title: 'B', points: 15, round: 1, attemptStatus: 'available' },
      ],
    });
  });

  it('treats a missing questions array as empty', () => {
    const parsed = sessionSchema.parse({
      success: true,
      message: 'ok',
      data: { id: 'u2', email: 'b@c.com', balance: '0', score: '0', round_qualified: 2 },
    });
    expect(parsed.questions).toEqual([]);
    expect(parsed.roundQualified).toBe(2);
  });
});
