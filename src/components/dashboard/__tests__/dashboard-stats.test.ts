import { describe, expect, it } from 'vitest';

import type { DashboardQuestionSummary } from '@/api/session';

import { roundCardState, summarizeRound, timelineMilestone } from '../dashboard-stats';

function question(
  id: string,
  points: number,
  attemptStatus: DashboardQuestionSummary['attemptStatus']
): DashboardQuestionSummary {
  return { id, title: id, points, round: 1, attemptStatus };
}

describe('roundCardState', () => {
  it('marks earlier rounds over, the qualified round current and later rounds locked', () => {
    expect(roundCardState(1, 2)).toBe('over');
    expect(roundCardState(2, 2)).toBe('current');
    expect(roundCardState(3, 2)).toBe('locked');
  });
});

describe('summarizeRound', () => {
  it('counts answered questions as completed and sums their points', () => {
    expect(
      summarizeRound([
        question('a', 10, 'answered'),
        question('b', 10, 'answered'),
        question('c', 5, 'answered'),
        question('d', 20, 'bought'),
      ])
    ).toEqual({ completed: 3, incomplete: 1, percent: 75, score: 25, totalPoints: 45 });
  });

  it('reports zero percent for a round with no questions', () => {
    expect(summarizeRound([])).toEqual({
      completed: 0,
      incomplete: 0,
      percent: 0,
      score: 0,
      totalPoints: 0,
    });
  });
});

describe('timelineMilestone', () => {
  it('puts each round on its own start flag and clamps out-of-range rounds', () => {
    expect(timelineMilestone(0)).toBe(0);
    expect(timelineMilestone(1)).toBe(1);
    expect(timelineMilestone(2)).toBe(2);
    expect(timelineMilestone(-1)).toBe(0);
    expect(timelineMilestone(9)).toBe(4);
  });

  // Round 3 has its own flag now, so a finalist rests on it instead of being
  // pushed onto END as if the contest were over.
  it('puts a round 3 finalist on the round 3 flag, not END', () => {
    expect(timelineMilestone(3)).toBe(3);
  });
});
