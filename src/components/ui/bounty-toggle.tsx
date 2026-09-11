/**
 * SHARED UI - Bounty Toggle
 *
 * Shows the current bounty state for a question.
 * Data source: `questions.bounty_active`.
 * Calls `POST /question/:id/bounty/activate` / `POST /question/:id/bounty/deactivate`.
 */
export interface BountyToggleProps {
  /** Question the bounty toggle applies to. */
  questionId: string;
  /** Whether the bounty is currently active. */
  active: boolean;
}

export function BountyToggle({ questionId, active }: BountyToggleProps) {
  void questionId;
  void active;
  return <div className="bounty-toggle"></div>;
}
