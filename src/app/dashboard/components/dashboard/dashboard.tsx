import Image from 'next/image';
import { Flag } from 'lucide-react';

import { Details } from './details';
import { Profile } from './profile';
import { Statistics } from './statistics';

import '@fontsource/cinzel';
import '@fontsource/nova-square';

import chefTimeline from '../../../../figma/chef_timeline.png';
import flag from '../../../../figma/flag.png';
import type { ContestDetails, RoundStat, TimelineStop, UserProfile } from '../../types/dashboard';

interface DashboardProps {
  profile: UserProfile;
  rounds: RoundStat[];
  details: ContestDetails;
  timeline: TimelineStop[];
}

export function Dashboard({ profile, rounds, details, timeline }: DashboardProps) {
  // Single source of truth: timeline progress is derived from XP, not
  // passed in separately. This is what was drifting out of sync before —
  // now there's only one number to keep correct.
  const timelineProgressPercent = Math.min(100, Math.max(0, (profile.xp / profile.xpMax) * 100));

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6 text-neutral-200">
      {/* Header */}
      <header className="mb-8 flex items-center justify-end border-b border-neutral-800 pb-4">
        <h1 className="font-serif text-4xl font-extrabold tracking-wide text-[#c1502e]">
          COOK OFF 11.0
        </h1>
      </header>

      {/* Timeline */}
      <section className="mr-10 mb-7 ml-10">
        <h2
          className="mb-6 text-4xl text-neutral-300"
          //style={{ fontFamily: '' }}
        >
          Timeline:
        </h2>

        {/* Fixed-height stage so every layer (track, fill, chef, nodes) can
            anchor to the exact same vertical center via top-1/2, instead of
            hand-picked pixel offsets (44px / 35px) that drift apart. */}
        <div className="relative h-32">
          {/* 1. BASE BACKGROUND TRACK (Grey) */}
          <div className="absolute inset-x-6 top-1/2 h-8 -translate-y-1/2 rounded-full bg-neutral-800" />

          {/* 2. PROGRESS TRACK FILL (Orange)
              NOTE: calc() only allows multiplying two dimensioned values
              (percent * length) if one side is a plain unitless number.
              So we convert the percent to a 0-1 fraction in JS first —
              `${timelineProgressPercent}% * (100% - 3rem)` is INVALID CSS
              and silently collapses to a 0-width box. */}
          <div
            className="absolute top-1/2 left-6 h-8 -translate-y-1/2 rounded-full bg-[#c1502e] transition-all duration-300"
            style={{
              width: `calc(${timelineProgressPercent / 100} * (100% - 3rem))`,
            }}
          />

          {/* 3. DYNAMIC FLOATING CHEF MARKER
              Anchored by its own center (translate -50%,-50%) to the same
              top-1/2 line as the track, marking exactly where the fill
              currently ends. Same unitless-fraction fix applied here. */}
          <div
            className="pointer-events-none absolute top-1/2 z-20 transition-all duration-300"
            style={{
              left: `calc(1.5rem + ${timelineProgressPercent / 100} * (100% - 3rem))`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <Image
              src={chefTimeline}
              alt="Current Progress Character"
              width={80}
              height={80}
              className="object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
            />
          </div>

          {/* 4. STATIONARY STOPS
              Row is centered on the same top-1/2 line as the track. Each
              stop's "reached" state is DERIVED from timelineProgressPercent
              here — not read off stop.reached — so a circle can never light
              up out of sync with where the bar/chef actually are. */}
          <div className="absolute inset-x-6 top-1/2 flex -translate-y-1/2 justify-between">
            {timeline.map((stop, index) => {
              const stopPercent = timeline.length > 1 ? (index / (timeline.length - 1)) * 100 : 0;
              const reached = timelineProgressPercent >= stopPercent;

              return (
                <div key={stop.label} className="relative z-10 flex flex-col items-center">
                  {/* Flag — pulled out of flow (absolute) so it can't push
                      the circle below it downward. */}
                  <Image
                    className="absolute bottom-full mb-1 rotate-12"
                    src={flag}
                    alt=""
                    width={40}
                    height={40}
                  />

                  {/* Stop Circle Node — now the only in-flow element in this
                      column, so it sits exactly on the row's centerline,
                      matching the track's vertical position. */}
                  <div
                    className={`h-[30px] w-[30px] rounded-full border-2 transition-all duration-300 ${
                      reached
                        ? 'border-white bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]'
                        : 'border-neutral-600 bg-neutral-900'
                    }`}
                  />

                  {/* Node Description Text — also pulled out of flow so it
                      doesn't affect the circle's position either. */}
                  <span className="absolute top-full mt-2 text-xs tracking-wide whitespace-nowrap text-neutral-400 uppercase">
                    {stop.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main grid: Profile | Statistics | Details */}
      <main className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr_280px]">
        <Profile profile={profile} />
        <Statistics rounds={rounds} />
        <Details details={details} />
      </main>
    </div>
  );
}
