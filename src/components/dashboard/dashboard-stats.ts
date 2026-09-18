import type { DashboardQuestionSummary } from '@/api/session';

export type RoundCardState = 'current' | 'over' | 'locked';

export interface RoundStats {
  completed: number;
  incomplete: number;
  percent: number;
  score: number;
  /** Every point on offer this round — the denominator for the profile bar. */
  totalPoints: number;
}

export const DASHBOARD_ROUNDS = [1, 2, 3] as const;

export function roundCardState(round: number, roundQualified: number): RoundCardState {
  if (round === roundQualified) return 'current';
  return round < roundQualified ? 'over' : 'locked';
}

/** `GET /dashboard` only returns the current round's questions, so stats exist for that round alone. */
export function summarizeRound(questions: DashboardQuestionSummary[]): RoundStats {
  const answered = questions.filter(question => question.attemptStatus === 'answered');
  const total = questions.length;
  return {
    completed: answered.length,
    incomplete: total - answered.length,
    percent: total === 0 ? 0 : Math.round((answered.length / total) * 100),
    score: answered.reduce((sum, question) => sum + question.points, 0),
    totalPoints: questions.reduce((sum, question) => sum + question.points, 0),
  };
}

// Timeline milestones are START, ROUND 1, ROUND 2, END. The chef sits on the
// flag where the qualified round starts; Round 3 has no flag of its own, so
// it sits on END.
const TIMELINE_LAST_MILESTONE = 3;

export function timelineMilestone(roundQualified: number): number {
  return Math.min(Math.max(roundQualified, 0), TIMELINE_LAST_MILESTONE);
}
