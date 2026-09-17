import type { Question, RoundId } from './types';

/**
 * The single seam between Round 1 ("Scratch"), Round 2 ("Chef's Pantry") and
 * Round 3 ("the Crucible"). Every behavioural difference between the rounds
 * belongs here — a `roundId === <n>` branch anywhere else in `src/components`
 * is a defect (see AGENTS.md "Rounds architecture").
 */
export interface RoundConfig {
  id: RoundId;
  name: string;
  label: string;
  /** Which gameplay engine renders the question: block-chain (R1) or Monaco (R2/R3). */
  engine: 'visual' | 'code';
  /** R1 has no buy-in; R2 gates the editor behind `POST /question/:id/attempt`; R3 does not. */
  hasBuyIn: boolean;
  /** R1/R3 hide the balance HUD entirely — R1 has no in-round currency, R3 wants it minimal. */
  hasCurrency: boolean;
  /** R1's Submit lives in the header next to the timer, not inside the engine. */
  headerSubmit: boolean;
  /** Visual identity of the header, tabs and page: R1's Figma `scratch` frame vs the R2/R3 IDE look. */
  chrome: 'scratch' | 'code';
  /**
   * R1 has no buy-in, yet `/submit/visual` 403s without a `bought` attempt
   * (L14) — so the attempt is created silently when a question opens.
   */
  autoAttempt: boolean;
  expectedQuestionCount: number;
  nominalDurationLabel: string;
  /** R3 has no next round: completion freezes the platform. */
  isFinalRound: boolean;
  intermissionCopy: {
    pending: string;
    ended: string;
    notQualified: string;
  };
}

const ROUND_CONFIG: Record<RoundId, RoundConfig> = {
  1: {
    id: 1,
    name: 'Scratch',
    label: 'Round 1',
    engine: 'visual',
    hasBuyIn: false,
    hasCurrency: false,
    headerSubmit: true,
    chrome: 'scratch',
    autoAttempt: true,
    expectedQuestionCount: 4,
    nominalDurationLabel: '01:00',
    isFinalRound: false,
    intermissionCopy: {
      pending: 'Round 1 begins shortly. Warm up your block-building skills.',
      ended: 'Round 1 has ended. Thank you for cooking — results are being tallied.',
      notQualified: 'Round 1 hasn’t opened for you yet.',
    },
  },
  2: {
    id: 2,
    name: "Chef's Pantry",
    label: 'Round 2',
    engine: 'code',
    hasBuyIn: true,
    hasCurrency: true,
    headerSubmit: false,
    chrome: 'code',
    autoAttempt: false,
    expectedQuestionCount: 12,
    nominalDurationLabel: '01:30',
    isFinalRound: false,
    intermissionCopy: {
      pending: "Chef's Pantry begins shortly. Place your bets wisely once the kitchen opens.",
      ended: 'Round 2 has ended. Thank you for cooking — results are being tallied.',
      notQualified: 'Round 2 is reserved for contestants who qualified out of Round 1.',
    },
  },
  3: {
    id: 3,
    name: 'the Crucible',
    label: 'Round 3',
    engine: 'code',
    hasBuyIn: false,
    hasCurrency: false,
    headerSubmit: false,
    chrome: 'code',
    autoAttempt: false,
    expectedQuestionCount: 4,
    nominalDurationLabel: '02:00',
    isFinalRound: true,
    intermissionCopy: {
      pending: 'The Crucible begins shortly. Only the top 16 contestants made it this far.',
      ended: 'The Crucible has ended. Thank you to every finalist — the platform is now frozen.',
      notQualified:
        'Thank you for your participation thus far. Only the top 16 contestants qualify for Round 3.',
    },
  },
};

export function getRoundConfig(roundId: RoundId): RoundConfig {
  return ROUND_CONFIG[roundId];
}

/**
 * No `difficulty` or ordering column exists on `questions` (L6). `points`
 * is the closest available proxy for difficulty per the product doc's
 * "increasing order of difficulty" requirement; title is a stable tiebreak.
 */
export function sortQuestionsForRound(questions: Question[]): Question[] {
  return [...questions].sort((a, b) => a.points - b.points || a.title.localeCompare(b.title));
}
