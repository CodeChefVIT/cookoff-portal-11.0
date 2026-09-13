/**
 * SHARED UI - Currency Box
 *
 * Displays the user's balance and, optionally, the current question's
 * buy-in/reward context. Only rendered when `RoundConfig.hasCurrency` is
 * true (never for Round 3 — see AGENTS.md "Rounds architecture").
 */
export interface CurrencyBoxProps {
  /** User's in-contest currency balance. */
  balance: number;
  /** Cost to attempt the question (questions.buy_in); 0 hides the detail. */
  buyIn?: number;
  /** Payout on a correct solve (questions.reward); 0 hides the detail. */
  reward?: number;
}

export function CurrencyBox({ balance, buyIn = 0, reward = 0 }: CurrencyBoxProps) {
  return (
    <div
      className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm font-medium text-coin"
      aria-label={`Balance: ${balance} coins`}
    >
      <span aria-hidden="true">🪙</span>
      <span>{balance}</span>
      {(buyIn > 0 || reward > 0) && (
        <span className="text-xs text-muted-foreground">
          {buyIn > 0 && <>bet {buyIn}</>}
          {buyIn > 0 && reward > 0 && ' · '}
          {reward > 0 && <>win {reward}</>}
        </span>
      )}
    </div>
  );
}
