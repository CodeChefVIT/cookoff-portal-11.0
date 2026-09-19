/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';

import type { RoundId } from '@/types';

import { getRoundConfig } from './round-config';
import { RoundTimer } from './RoundTimer';

export type IntermissionVariant = 'pending' | 'ended' | 'notQualified' | 'finished';

export interface RoundIntermissionProps {
  roundId: RoundId;
  variant: IntermissionVariant;
}

const ASSET_PATH = '/loading-page-assests';

interface RingConfig {
  size: number; // % of stage width
  ratio?: number; // natural width / height
  rotate: number; // deg, base offset
  duration: number; // s
  reverse?: boolean;
  opacity: number;
}

// Concentric Roman-numeral rings rotating around the portal
const NUMERAL_RINGS: RingConfig[] = [
  { size: 32, rotate: 8, duration: 46, opacity: 0.6 },
  { size: 54, rotate: -30, duration: 62, reverse: true, opacity: 0.75 },
  { size: 76, rotate: 55, duration: 78, opacity: 0.88 },
  { size: 100, rotate: -70, duration: 96, reverse: true, opacity: 1 },
];

function SpinLayer({
  size,
  ratio = 1,
  rotate,
  duration,
  reverse,
  opacity,
  src,
}: RingConfig & { src: string }) {
  return (
    <div
      className="absolute top-1/2 left-1/2"
      style={{
        width: `${size}%`,
        aspectRatio: ratio,
        transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
      }}
    >
      <img
        src={src}
        alt=""
        className="h-full w-full motion-reduce:animate-none"
        style={{
          animation: `${reverse ? 'portal-spin-reverse' : 'portal-spin'} ${duration}s linear infinite`,
          opacity,
        }}
      />
    </div>
  );
}

/**
 * Full-viewport screens for every non-`LIVE` `RoundGate` state.
 * Features the animated Roman-numeral portal clock with starry backdrop
 * and a frosted glassmorphic card with backdrop blur.
 */
export function RoundIntermission({ roundId, variant }: RoundIntermissionProps) {
  const config = getRoundConfig(roundId);

  const heading =
    variant === 'notQualified'
      ? "You didn't make the cut"
      : variant === 'finished'
        ? 'Thank you for competing'
        : variant === 'ended'
          ? `${config.name} has ended`
          : config.name;

  const body =
    variant === 'notQualified'
      ? config.intermissionCopy.notQualified
      : variant === 'ended' || variant === 'finished'
        ? config.intermissionCopy.ended
        : config.intermissionCopy.pending;

  const showEyebrow = !heading.startsWith(config.label);

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#0b0908] px-6 py-10 text-center">
      {/* Background Starry Field */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage: [
            'radial-gradient(1px 1px at 12% 18%, #fff 50%, transparent 55%)',
            'radial-gradient(1px 1px at 70% 8%, #fff 50%, transparent 55%)',
            'radial-gradient(1.5px 1.5px at 35% 62%, #fff 50%, transparent 55%)',
            'radial-gradient(1px 1px at 88% 75%, #fff 50%, transparent 55%)',
            'radial-gradient(1px 1px at 55% 90%, #fff 50%, transparent 55%)',
            'radial-gradient(1.5px 1.5px at 20% 45%, #fff 50%, transparent 55%)',
            'radial-gradient(1px 1px at 92% 30%, #fff 50%, transparent 55%)',
          ].join(','),
          backgroundRepeat: 'repeat',
          backgroundSize: '260px 260px',
        }}
      />

      {/* Background Portal Clock / Concentric Spinning Rings */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 aspect-square w-[min(95vw,75vh)] max-w-[680px] -translate-x-1/2 -translate-y-1/2 opacity-70"
      >
        <img
          src={`${ASSET_PATH}/brown-hole.svg`}
          alt=""
          className="absolute inset-0 h-full w-full"
        />

        <SpinLayer
          src={`${ASSET_PATH}/r-lines-2.svg`}
          size={66}
          ratio={1271 / 1259}
          rotate={0}
          duration={120}
          opacity={0.9}
        />
        <SpinLayer
          src={`${ASSET_PATH}/r-line-1.svg`}
          size={112}
          ratio={1252 / 1215}
          rotate={0}
          duration={140}
          reverse
          opacity={0.85}
        />

        {NUMERAL_RINGS.map(ring => (
          <SpinLayer key={ring.size} src={`${ASSET_PATH}/nums.svg`} ratio={189 / 188} {...ring} />
        ))}

        <img
          src={`${ASSET_PATH}/chef-hat-glass.svg`}
          alt=""
          className="absolute inset-0 m-auto w-[31.2%] motion-reduce:animate-none"
          style={{
            animation: 'portal-bob 3.2s ease-in-out infinite',
            filter: 'drop-shadow(0 0 30px rgba(191, 98, 70, 0.55))',
          }}
        />
      </div>

      {/* Frosted Glass Container with Backdrop Blur */}
      <div className="relative z-10 flex max-w-lg flex-col items-center justify-center gap-5 rounded-2xl border border-white/15 bg-[#14100e]/80 p-8 shadow-2xl shadow-black/80 backdrop-blur-xl sm:p-10">
        {showEyebrow && (
          <p className="font-scratch-sans text-xs font-bold tracking-[0.2em] text-[#e7ddce]/60 uppercase">
            {config.label}
          </p>
        )}
        <h1 className="font-display text-3xl font-bold tracking-wide text-brand drop-shadow-md sm:text-4xl">
          {heading}
        </h1>
        <p className="max-w-md font-sans text-sm leading-relaxed text-[#e7ddce]/85 sm:text-base">
          {body}
        </p>

        {variant === 'pending' && (
          <div className="my-1">
            <RoundTimer />
          </div>
        )}

        <Link
          href="/dashboard"
          className="mt-2 rounded-full border border-white/20 bg-secondary/80 px-6 py-2 text-sm font-semibold text-secondary-foreground shadow-md transition-all duration-200 hover:border-white/40 hover:bg-secondary hover:shadow-lg focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
