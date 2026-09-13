import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAttempt } from '../attempts';

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
    });
    expect(requestMock).toHaveBeenCalledWith({ url: '/attempts/q1', method: 'POST', data: {} });
  });
});
