/**
 * SHARED UI - Currency Box
 *
 * Displays the user's balance and the question's buy-in/reward.
 * Data source: `users.balance`, `questions.buy_in`, `questions.reward`.
 *
 * Conditionally rendered in <RoundShell>: NOT shown when roundId === 3.
 */
export interface CurrencyBoxProps {
  /** User's in-contest currency balance. */
  balance: number;
  /** Cost to attempt the question (questions.buy_in). */
  buyIn: number;
  /** Payout on a correct solve (questions.reward). */
  reward: number;
}

export function CurrencyBox({ balance, buyIn, reward }: CurrencyBoxProps) {
  void balance;
  void buyIn;
  void reward;
  return <div className="currency-box"></div>;
}
