import type { Question } from './types';

/**
 * The single seam between Round 2 ("Chef's Pantry") and Round 3
 * ("the Crucible"). Every behavioural difference between the two rounds
 * belongs here — a `roundId === 3` branch anywhere else in `src/components`
 * is a defect (see AGENTS.md "Rounds architecture").
 */
export interface RoundConfig {
  id: 2 | 3;
  name: string;
  label: string;
  /** R2 gates the editor behind `POST /question/:id/attempt`; R3 does not. */
  hasBuyIn: boolean;
  /** R3 hides the balance HUD entirely (product doc: "as minimal as possible"). */
  hasCurrency: boolean;
  /** R3 drops chrome beyond the timer and question tabs. */
  minimalHud: boolean;
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

const ROUND_CONFIG: Record<2 | 3, RoundConfig> = {
  2: {
    id: 2,
    name: "Chef's Pantry",
    label: 'Round 2',
    hasBuyIn: true,
    hasCurrency: true,
    minimalHud: false,
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
    hasBuyIn: false,
    hasCurrency: false,
    minimalHud: true,
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

export function getRoundConfig(roundId: 2 | 3): RoundConfig {
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
