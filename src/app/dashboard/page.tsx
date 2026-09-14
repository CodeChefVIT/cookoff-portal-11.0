'use client';

import { useState } from 'react';

import type { ContestDetails, RoundStat, TimelineStop, UserProfile } from '../types/dashboard';
import { Dashboard } from './components/dashboard/dashboard';

// Same shape as your real mock data — swap these to test different states.
const profile: UserProfile = {
  name: 'AKSHARA N',
  userId: 'User_Id',
  email: 'Email',
  xp: 1400,
  xpMax: 2000,
};

const rounds: RoundStat[] = [
  {
    roundNumber: 1,
    status: 'closed',
    percentComplete: 75,
    completedCount: 3,
    incompleteCount: 1,
    score: 20,
  },
  {
    roundNumber: 2,
    status: 'closed',
    percentComplete: 75,
    completedCount: 3,
    incompleteCount: 1,
    score: 20,
  },
  {
    roundNumber: 3,
    status: 'locked',
    percentComplete: 0,
    completedCount: 0,
    incompleteCount: 0,
    score: 0,
  },
  {
    roundNumber: 4,
    status: 'locked',
    percentComplete: 0,
    completedCount: 0,
    incompleteCount: 0,
    score: 0,
  },
];

const details: ContestDetails = {
  currentRound: 2,
  timeRemaining: '00:50:45',
  balanceCoins: 56,
};

// "reached" no longer matters — Dashboard derives it from
// timelineProgressPercent — but the field stays until you clean up the type.
const timeline: TimelineStop[] = [
  { label: 'START', reached: true },
  { label: 'ROUND 1', reached: true },
  { label: 'ROUND 2', reached: false },
  { label: 'END', reached: false },
];

export default function TimelineTestPage() {
  const xpMax = 2000;
  const [xp, setXp] = useState(1400);
  const percent = Math.round((xp / xpMax) * 100);

  return (
    <div>
      {/* Floating control panel — dev-only, remove before shipping */}
      <div className="fixed top-4 right-4 z-50 w-72 rounded-lg border border-neutral-700 bg-[#111111] p-4 shadow-lg">
        <label htmlFor="xp-slider" className="mb-2 block text-xs text-neutral-400">
          xp: {xp} / {xpMax} ({percent}%)
        </label>
        <input
          id="xp-slider"
          type="range"
          min={0}
          max={xpMax}
          value={xp}
          onChange={e => setXp(Number(e.target.value))}
          className="w-full accent-[#c1502e]"
        />
        <div className="mt-2 flex justify-between">
          {[0, 25, 50, 75, 100].map(preset => (
            <button
              key={preset}
              onClick={() => setXp(Math.round((preset / 100) * xpMax))}
              className="px-1 text-xs text-neutral-400 hover:text-neutral-100"
            >
              {preset}%
            </button>
          ))}
        </div>
      </div>

      <Dashboard
        profile={{ ...profile, xp, xpMax }}
        rounds={rounds}
        details={details}
        timeline={timeline}
      />
    </div>
  );
}
