interface Props {
  percent: number;
}

// Rebuilds Figma's two 75% arc exports (Background/Front, 323:1867–1869) as
// one data-driven ellipse. The 57.54×55.37 node's stroke overflows it by
// 4.43px, hence the offset 66.4×64.22 canvas. The front arc starts at 12 o'clock.
const ARC = 'M33.2 4.43 A28.77 27.68 0 1 1 33.2 59.79 A28.77 27.68 0 1 1 33.2 4.43';

export function ProgressRing({ percent }: Props) {
  return (
    <div className="absolute top-[88px] left-[18.59px] h-[55.366px] w-[57.541px] opacity-90">
      <svg
        aria-hidden
        viewBox="0 0 66.3992 64.2248"
        className="absolute -top-[4.43px] -left-[4.43px] h-[64.2248px] w-[66.3992px] overflow-visible"
      >
        <path d={ARC} fill="none" stroke="var(--dash-track)" strokeWidth={8.85857} />
        {percent > 0 && (
          <path
            d={ARC}
            fill="none"
            stroke="var(--brand-accent)"
            strokeWidth={8.85857}
            strokeLinecap="round"
            opacity={0.75}
            pathLength={100}
            strokeDasharray={`${percent} 100`}
          />
        )}
      </svg>
      <span className="absolute top-[19.38px] left-[15.48px] font-scratch-sans text-[12.181px] leading-normal font-black whitespace-nowrap text-dash-label [font-variation-settings:'opsz'_14]">
        {percent}%
      </span>
    </div>
  );
}
