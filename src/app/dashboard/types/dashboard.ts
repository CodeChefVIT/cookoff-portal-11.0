export type RoundStatus = 'closed' | 'locked' | 'open';

export interface RoundStat {
  roundNumber: number;
  status: RoundStatus;
  percentComplete: number; // 0-100, drives the ring
  completedCount: number;
  incompleteCount: number;
  score: number;
}

export interface UserProfile {
  name: string;
  userId: string;
  email: string;
  xp: number;
  xpMax: number;
  avatarUrl?: string;
}

export interface ContestDetails {
  currentRound: number;
  timeRemaining: string; // "HH:MM:SS" — wire up your own countdown
  balanceCoins: number;
}

export interface TimelineStop {
  label: string; // "START" | "ROUND 1" | "ROUND 2" | "END"
  reached: boolean;
}
