import { describe, expect, it } from 'vitest';

import { remainingMs, roundTimeSchema } from '../timer';

describe('remainingMs', () => {
  const now = Date.UTC(2026, 8, 17, 12, 0, 0);

  it('returns 0 when endTime is null', () => {
    expect(remainingMs(null, now)).toBe(0);
  });

  it('clamps at 0 once the end time has passed', () => {
    expect(remainingMs(new Date(now - 10_000), now)).toBe(0);
  });

  it('returns the milliseconds from now until the end time', () => {
    expect(remainingMs(new Date(now + 60_000), now)).toBe(60_000);
  });

  it('shrinks as now advances', () => {
    const endTime = new Date(now + 60_000);
    expect(remainingMs(endTime, now + 1_000)).toBe(59_000);
  });
});

describe('roundTimeSchema', () => {
  it('uses the exact end_time when the device clock agrees with the server', () => {
    const endTime = new Date(Date.now() + 600_500);
    const parsed = roundTimeSchema.parse({
      success: true,
      message: 'Contest timer fetched successfully',
      data: {
        round: 2,
        is_running: true,
        duration: 3600,
        start_time: '2026-09-17T10:00:00Z',
        end_time: endTime.toISOString(),
        time_left: 600,
      },
    });
    expect(parsed.roundEndTime?.getTime()).toBe(endTime.getTime());
  });

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
