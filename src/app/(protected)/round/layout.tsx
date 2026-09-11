import type { ReactNode } from 'react';

/**
 * SHARED ROUND LAYOUT (the "Shell" contract)
 *
 * Every round (1, 2, 3) renders inside this layout so the Timer, Header,
 * and Currency side effects stay consistent across all rounds.
 *
 * TODO: Wrap children with <RoundShell>. Refresh the user's balance here
 * after any buy-in. Conditionally hide the <CurrencyBox> when roundId === 3.
 */
export default function RoundLayout({ children }: { children: ReactNode }) {
  return <div className="round-layout">{children}</div>;
}
