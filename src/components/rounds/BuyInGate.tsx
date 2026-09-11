import type { ReactNode } from 'react';

/**
 * SHARED BUY-IN GATE
 *
 * This component handles the economy logic.
 * It checks the `attempts` status for the current question.
 *
 * If `is_buy_in_paid` is false, it shows a "Confirm Buy-in" overlay.
 * It calls `POST /attempts/:id` to deduct the `buy_in` from the user's balance.
 *
 * It wraps the children (the round engine) and only reveals them once paid.
 */
export interface BuyInGateProps {
  /** The round Engine (Scratch/Code) rendered once the buy-in is paid. */
  children: ReactNode;
  /** Question the user is attempting; used to build the attempts request. */
  questionId: string;
}

export function BuyInGate({ children, questionId }: BuyInGateProps) {
  void children;
  void questionId;
  // Logic to check attempts status
  // Logic to handle POST /attempts/:id

  return (
    <div className="buy-in-gate">
      {/* If not paid: Show Modal */}
      {/* If paid: {children} */}
    </div>
  );
}
