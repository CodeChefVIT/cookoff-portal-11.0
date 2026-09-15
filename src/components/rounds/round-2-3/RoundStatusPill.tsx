import { RoundTimer } from '../RoundTimer';

export interface RoundStatusPillProps {
  /** `RoundConfig.label`, e.g. "Round 2". */
  label: string;
}

/**
 * Round badge + timer capsule from Figma `Desktop - 15/14` (312:1101,
 * 312:1216): a 252×29.77 pill with a #b7ab98 border over a brand-accent fill
 * on its left 124px. Sits above the editor — the header has no timer here.
 */
export function RoundStatusPill({ label }: RoundStatusPillProps) {
  return (
    <div className="relative h-[29.766px] w-[252px] shrink-0">
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-[124px] rounded-l-[10px] bg-brand-accent"
      />
      <span className="absolute top-[1.95px] left-[11px] font-round text-[22px] leading-[25.075px] whitespace-nowrap text-black capitalize">
        {label}
      </span>
      <RoundTimer
        variant="inline"
        className="absolute top-[14.55px] left-[188.5px] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[10px] border border-code-sand"
      />
    </div>
  );
}
