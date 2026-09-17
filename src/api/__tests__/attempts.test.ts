import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAttempt } from '../attempts';
import { ApiError } from '../errors';

const { requestMock } = vi.hoisted(() => ({ requestMock: vi.fn() }));

vi.mock('../request', () => ({ request: requestMock }));

afterEach(() => {
  requestMock.mockReset();
});

describe('createAttempt', () => {
  it('POSTs to /attempts/:id (attempt_routes.go) and reports an unlock', async () => {
    requestMock.mockResolvedValue({ success: true, message: 'ok', data: {} });

    await expect(createAttempt('q1')).resolves.toEqual({
      unlocked: true,
      insufficientBalance: false,
      roundNotRunning: false,
    });
    expect(requestMock).toHaveBeenCalledWith({ url: '/attempts/q1', method: 'POST', data: {} });
  });

  it('treats a 409 as an already-unlocked question (L3)', async () => {
    requestMock.mockRejectedValue(new ApiError({ message: 'Attempt already exists', status: 409 }));

    await expect(createAttempt('q1')).resolves.toEqual({
      unlocked: true,
      insufficientBalance: false,
      roundNotRunning: false,
    });
  });

  it('reports a 402 as an affordability failure', async () => {
    requestMock.mockRejectedValue(new ApiError({ message: 'Insufficient balance', status: 402 }));

    await expect(createAttempt('q1')).resolves.toEqual({
      unlocked: false,
      insufficientBalance: true,
      roundNotRunning: false,
    });
  });

  // `ensureRoundRunning` (internal/controllers/timer.go) answers 423 when the
  // contest timer is stopped or on another round. It must not be mistaken for
  // an affordability failure — the balance was never touched.
  it('reports a 423 as the round not running, not a balance problem', async () => {
    requestMock.mockRejectedValue(new ApiError({ message: 'Round is not running', status: 423 }));

    await expect(createAttempt('q1')).resolves.toEqual({
      unlocked: false,
      insufficientBalance: false,
      roundNotRunning: true,
    });
  });
});
