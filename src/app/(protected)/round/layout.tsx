import type { ReactNode } from 'react';

/**
 * Round 1, 2, and 3 render inside this layout. `RoundGate`/`RoundShell` live
 * one level down (in each `round/[id]` adapter) because they need the
 * numeric `roundId`, which this shared segment doesn't have.
 */
export default function RoundLayout({ children }: { children: ReactNode }) {
  return <div className="round-layout">{children}</div>;
}
