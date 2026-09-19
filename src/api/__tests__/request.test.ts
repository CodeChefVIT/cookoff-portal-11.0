import { describe, expect, it, vi } from 'vitest';

import { ApiError } from '../errors';

const { requestMock } = vi.hoisted(() => ({ requestMock: vi.fn() }));

vi.mock('../client', () => ({
  api: { request: requestMock },
  createApiClient: vi.fn(),
}));

const { request } = await import('../request');

describe('request', () => {
  it('returns response data when client.request succeeds', async () => {
    const data = { success: true, data: { id: '1' } };
    requestMock.mockResolvedValue({ data });

    const result = await request({ url: '/test' });
    expect(result).toBe(data);
  });

  it('converts a non-AxiosError thrown by client.request into an ApiError', async () => {
    const rawError = new Error('unexpected failure');
    requestMock.mockRejectedValue(rawError);
    await expect(request({ url: '/test' })).rejects.toBeInstanceOf(ApiError);
  });

  it('converts an AxiosError thrown by client.request into an ApiError', async () => {
    const { AxiosError } = await import('axios');
    const axiosErr = new AxiosError('Request failed', 'ERR_BAD_REQUEST');
    Object.defineProperty(axiosErr, 'response', {
      value: { status: 404, data: { message: 'Not found', code: 'NOT_FOUND' } },
    });
    requestMock.mockRejectedValue(axiosErr);
    await expect(request({ url: '/test' })).rejects.toBeInstanceOf(ApiError);
  });
});
