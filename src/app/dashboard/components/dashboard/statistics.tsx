import { Check, Lock, X } from 'lucide-react';

import type { RoundStat } from '../../types/dashboard';

interface StatisticsProps {
  rounds: RoundStat[];
}

export function Statistics({ rounds }: StatisticsProps) {
  return (
    <section
      className="rounded-lg border border-amber-900/60 p-6"
      style={{ background: 'linear-gradient(to bottom, #1d2127 0%, #0d0f11 100%)' }}
    >
      <h2 className="mb-6 text-sm font-semibold tracking-widest text-neutral-300">STATISTICS</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {rounds.map(round => (
          <RoundCard key={round.roundNumber} round={round} />
        ))}
      </div>
    </section>
  );
}

function RoundCard({ round }: { round: RoundStat }) {
  const isLocked = round.status === 'locked';
  const statusLabel =
    round.status === 'closed' ? 'Closed' : round.status === 'locked' ? 'Locked' : 'Open';

  return (
    <div
      className={`relative rounded-lg border border-neutral-800 bg-[#0a0a0a] p-4 ${
        isLocked ? 'opacity-40' : ''
      }`}
    >
      {/* Header: round label + status dot */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold tracking-widest text-neutral-400">
          ROUND {round.roundNumber}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-neutral-400">
          <span
            className={`h-2 w-2 rounded-full ${
              round.status === 'closed' ? 'bg-red-500' : 'bg-neutral-600'
            }`}
          />
          {statusLabel}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <ProgressRing percent={round.percentComplete} locked={isLocked} />

        <div className="flex flex-col gap-1 text-xs">
          {isLocked ? (
            <span className="text-neutral-500">Locked details hidden</span>
          ) : (
            <>
              <span className="flex items-center gap-1.5 text-neutral-300">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                Completed: {round.completedCount}
              </span>
              <span className="flex items-center gap-1.5 text-neutral-300">
                <X className="h-3.5 w-3.5 text-red-500" />
                Incomplete: {round.incompleteCount}
              </span>
            </>
          )}
        </div>
      </div>

      <p className="mt-3 text-xs text-neutral-400">Score: {isLocked ? '--' : round.score}</p>

      {/* Locked overlay */}
      {isLocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-[#0a0a0a]/70">
          <Lock className="h-5 w-5 text-neutral-300" />
          <span className="text-xs font-medium text-neutral-300">This Round is Locked</span>
        </div>
      )}
    </div>
  );
}

function ProgressRing({ percent, locked }: { percent: number; locked: boolean }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative h-14 w-14 shrink-0">
      <svg viewBox="0 0 56 56" className="h-14 w-14 -rotate-90">
        <circle cx="28" cy="28" r={radius} fill="none" stroke="#2a2a2a" strokeWidth="5" />
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke={locked ? '#4b4b4b' : '#c1502e'}
          strokeWidth="5"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-neutral-200">
        {percent}%
      </span>
    </div>
  );
}
