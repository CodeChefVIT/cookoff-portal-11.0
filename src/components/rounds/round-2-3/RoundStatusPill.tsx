import { RoundTimer } from '../RoundTimer';

export interface RoundStatusPillProps {
  /** `RoundConfig.label`, e.g. "Round 2". */
  label: string;
}

/**
 * Round badge + timer capsule from Figma `Desktop - 15/14` (312:1101,
 * 312:1216): a #b7ab98-bordered 29.77px pill, brand-accent label segment on
 * the left. Sized by padding (the frame's 11px/8.5px label and 13px/10px timer
 * insets, the timer's right one net of its 2px tracking) rather than fixed widths, so wider labels/digits never touch the
 * segment edge. Sits above the editor — the header has no timer here.
 */
export function RoundStatusPill({ label }: RoundStatusPillProps) {
  return (
    <div className="flex h-[29.766px] w-fit shrink-0 items-center overflow-hidden rounded-[10px] border border-code-sand">
      <span className="flex h-full items-center bg-brand-accent pr-[8.5px] pl-[11px] font-round text-[22px] leading-[25.075px] whitespace-nowrap text-black capitalize">
        {label}
      </span>
      <RoundTimer variant="inline" className="pr-[8px] pl-[13px] whitespace-nowrap" />
    </div>
  );
}
