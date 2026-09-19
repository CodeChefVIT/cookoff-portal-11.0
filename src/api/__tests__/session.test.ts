import type { InternalAxiosRequestConfig } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { api } from '../client';
import { logout, sessionSchema } from '../session';

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
      name: 'Ada',
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

describe('logout', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('sends POST /logout to invalidate cookies and session', async () => {
    const postSpy = vi.spyOn(api, 'request').mockResolvedValueOnce({
      status: 204,
      data: null,
      headers: {},
      statusText: 'No Content',
      config: {} as InternalAxiosRequestConfig,
    });

    await logout();

    expect(postSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/logout',
        method: 'POST',
      })
    );
  });
});
