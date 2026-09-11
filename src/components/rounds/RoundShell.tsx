import type { ReactNode } from 'react';

import type { Question } from './types';

/**
 * SHARED SHELL COMPONENT
 *
 * This is the "Master Layout" for all rounds (1, 2, and 3).
 * It handles:
 * - Round Timer (countdown/elapsed)
 * - Question Header (Title, Points, Constraints)
 * - Bounty Toggle
 *
 * It conditionally renders the <CurrencyBox> based on the roundId.
 * (Note: Round 3 does NOT show the currency box).
 */
export interface RoundShellProps {
  /** Page content rendered within the shell (the round Engine). */
  children: ReactNode;
  /** Current round id used to select styling and hide currency for round 3. */
  roundId: number;
  /** Current question shown to the user. */
  question: Question;
}

export function RoundShell({ children, roundId, question }: RoundShellProps) {
  void roundId;
  void question;
  return (
    <div className="round-shell">
      {/* Timer Logic */}
      {/* Header Logic */}
      {/* {roundId !== 3 && <CurrencyBox />} */}
      {children}
    </div>
  );
}
