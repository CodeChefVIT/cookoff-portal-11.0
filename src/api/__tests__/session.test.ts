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
          { id: 'q2', title: 'B', points: 15, round: 1, attempt_status: 'bought' },
          { id: 'q3', title: 'C', points: 20, round: 1, attempt_status: 'available' },
        ],
        attempt_totals: { available: 1, bought: 1, answered: 1 },
      },
    });

    expect(parsed).toEqual({
      userId: 'u1',
      email: 'ada@vitstudent.ac.in',
      balance: 120.5,
      score: 40,
      roundQualified: 1,
      isBanned: false,
      attemptStatuses: { q1: 'answered', q2: 'bought', q3: 'available' },
    });
  });

  it('still accepts a bare (unwrapped) payload', () => {
    const parsed = sessionSchema.parse({ user_id: 'u2', round_qualified: 2, balance: 5 });
    expect(parsed).toMatchObject({ userId: 'u2', roundQualified: 2, balance: 5 });
    expect(parsed.attemptStatuses).toEqual({});
  });

  it('skips malformed dashboard question entries', () => {
    const parsed = sessionSchema.parse({
      data: {
        id: 'u3',
        round_qualified: 1,
        questions: [
          null,
          { id: 'q1' },
          { id: 'q2', attempt_status: 'stolen' },
          { id: 'q3', attempt_status: 'bought' },
        ],
      },
    });
    expect(parsed.attemptStatuses).toEqual({ q3: 'bought' });
  });
});
