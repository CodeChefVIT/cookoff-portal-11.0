import { Clock, Coins } from 'lucide-react';

import type { ContestDetails } from '../../types/dashboard';

interface DetailsProps {
  details: ContestDetails;
}

export function Details({ details }: DetailsProps) {
  return (
    <section
      className="flex flex-col gap-6 rounded-lg border border-amber-900/60 p-6"
      style={{ background: 'linear-gradient(to bottom, #1d2127 0%, #0d0f11 100%)' }}
    >
      <h2 className="text-sm font-semibold tracking-widest text-neutral-300">DETAILS</h2>

      {/* Current round */}
      <div>
        <p className="mb-1 text-xs tracking-widest text-neutral-400">CURRENT ROUND:</p>
        <p className="text-2xl font-bold text-neutral-100">ROUND {details.currentRound}</p>
      </div>

      {/* Time remaining */}
      <div>
        <p className="mb-2 text-xs tracking-widest text-neutral-400">TIME REMAINING:</p>
        <div className="flex items-center gap-2 rounded-md border border-neutral-700 px-4 py-2.5">
          <Clock className="h-4 w-4 text-neutral-300" />
          <span className="font-mono text-sm text-neutral-100">{details.timeRemaining}</span>
        </div>
      </div>

      {/* Balance remaining */}
      <div>
        <p className="mb-2 text-xs tracking-widest text-neutral-400">BALANCE REMAINING:</p>
        <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-[#c1502e]/60 bg-[#0a0a0a] py-6">
          <Coins className="h-8 w-8 text-[#c1502e]" />
          <span className="text-lg font-bold text-neutral-100">{details.balanceCoins} COINS</span>
        </div>
      </div>
    </section>
  );
}
