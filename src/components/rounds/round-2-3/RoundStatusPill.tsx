export interface RoundStatusPillProps {
  /** `RoundConfig.label`, e.g. "Round 2". */
  label: string;
}

/**
 * Round badge from Figma `Desktop - 15/14` (312:1101, 312:1216): a
 * #b7ab98-bordered 29.77px pill with the brand-accent label, sized by the
 * frame's 11px/8.5px insets. Figma's timer segment is dropped — the header's
 * timer box shows the time instead.
 */
export function RoundStatusPill({ label }: RoundStatusPillProps) {
  return (
    <div className="flex h-[29.766px] w-fit shrink-0 items-center overflow-hidden rounded-[10px] border border-code-sand">
      <span className="flex h-full items-center bg-brand-accent pr-[8.5px] pl-[11px] font-round text-[22px] leading-[25.075px] whitespace-nowrap text-black capitalize">
        {label}
      </span>
    </div>
  );
}
