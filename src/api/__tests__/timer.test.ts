import { describe, expect, it } from 'vitest';

import { computeClockOffset, remainingMs } from '../timer';

describe('computeClockOffset', () => {
  it('returns 0 when serverTime is null', () => {
    expect(computeClockOffset(null)).toBe(0);
  });

  it('computes the difference between server and local time', () => {
    const serverTime = new Date(Date.now() + 5_000);
    expect(computeClockOffset(serverTime)).toBeGreaterThanOrEqual(4_900);
  });
});

describe('remainingMs', () => {
  it('returns 0 when endTime is null', () => {
    expect(remainingMs(null, 0)).toBe(0);
  });

  it('clamps at 0 once the end time has passed', () => {
    const endTime = new Date(Date.now() - 10_000);
    expect(remainingMs(endTime, 0)).toBe(0);
  });

  it('returns the remaining milliseconds before expiry', () => {
    const endTime = new Date(Date.now() + 60_000);
    const remaining = remainingMs(endTime, 0);
    expect(remaining).toBeGreaterThan(58_000);
    expect(remaining).toBeLessThanOrEqual(60_000);
  });

  it('applies the offset before computing remaining time', () => {
    const endTime = new Date(Date.now() + 10_000);
    // A large negative offset (server thinks it's much earlier) should
    // increase the apparent remaining time.
    const remaining = remainingMs(endTime, -50_000);
    expect(remaining).toBeGreaterThan(50_000);
  });
});
