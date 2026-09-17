import { describe, expect, it } from 'vitest';

import { computeClockOffset, remainingMs, roundTimeSchema } from '../timer';

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

describe('roundTimeSchema', () => {
  it('anchors a running round on time_left', () => {
    const parsed = roundTimeSchema.parse({
      success: true,
      message: 'Contest timer fetched successfully',
      data: {
        round: 2,
        is_running: true,
        duration: 3600,
        start_time: '2026-09-17T10:00:00Z',
        end_time: '2026-09-17T11:00:00Z',
        time_left: 600,
      },
    });
    expect(parsed.round).toBe(2);
    expect(parsed.roundStartTime?.toISOString()).toBe('2026-09-17T10:00:00.000Z');
    const left = (parsed.roundEndTime?.getTime() ?? 0) - Date.now();
    expect(left).toBeGreaterThan(595_000);
    expect(left).toBeLessThanOrEqual(600_000);
  });

  it('has no end time for a round that has not started', () => {
    const parsed = roundTimeSchema.parse({
      success: true,
      message: 'Contest timer fetched successfully',
      data: {
        round: 1,
        is_running: false,
        duration: 3600,
        start_time: null,
        end_time: null,
        time_left: 0,
      },
    });
    expect(parsed.roundEndTime).toBeNull();
    expect(parsed.roundStartTime).toBeNull();
  });
});
