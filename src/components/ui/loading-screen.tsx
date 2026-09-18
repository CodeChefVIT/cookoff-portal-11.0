import { cn } from '@/lib/utils';

/**
 * Shared full-viewport loading state (issue: "Loading Page"). Recreated from
 * the confirmed design mockup as a Roman-numeral "portal" clock around the
 * chef-hat/hourglass mark — assets in public/loading-page-assests. Used both
 * as a standalone route fallback (`app/(protected)/loading.tsx`,
 * `app/(auth)/loading.tsx`) and inline at async boundaries that want the
 * same look (`RoundGate`, `SessionGuard`).
 */
export interface LoadingScreenProps {
  message?: string;
  className?: string;
}

const ASSET_PATH = '/loading-page-assests';

interface RingConfig {
  size: number; // % of stage width
  ratio?: number; // natural width / height — defaults to 1 (square asset)
  rotate: number; // deg, base offset
  duration: number; // s
  reverse?: boolean;
  opacity: number;
}

// Evenly spaced (~22-24pt steps) so rings read as distinct, not crowded.
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

export function LoadingScreen({ message = 'Loading…', className }: LoadingScreenProps) {
  return (
    <div
      className={cn(
        'relative flex min-h-dvh flex-col items-center justify-center gap-8 overflow-hidden bg-[#0b0908] px-6 py-10 text-center',
        className
      )}
      role="status"
    >
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

      <div
        aria-hidden="true"
        className="relative aspect-square w-[min(90vw,68vh)] max-w-[620px] shrink-0"
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

      <span className="relative font-display text-sm tracking-[0.35em] text-[#e7ddce] uppercase">
        {message}
      </span>
    </div>
  );
}
