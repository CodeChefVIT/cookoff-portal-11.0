import Image from 'next/image';

import { timelineMilestone } from './dashboard-stats';

/**
 * The track spans the full width of the panels below it — Profile's left edge
 * (19) to Details' right edge (1421) on the 1440 stage — rather than Figma's
 * narrower 124→1317 band, so the dashboard reads as one aligned column.
 *
 * A flag group is positioned by its left edge and its dot centres `DOT_INSET`
 * in from there, so the last flag sits `(W - 2·inset) / W` along the track to
 * leave the same inset at both ends. The rounds divide that span evenly; Figma
 * drew no stop for Round 3, which is why a finalist's chef used to rest on END.
 */
const TRACK_WIDTH_PX = 1402;
const DOT_INSET_PX = 22;
const LAST_OFFSET = ((TRACK_WIDTH_PX - DOT_INSET_PX * 2) / TRACK_WIDTH_PX) * 100;
const LABELS = ['START', 'ROUND 1', 'ROUND 2', 'ROUND 3', 'END'] as const;

const MILESTONES = LABELS.map((label, index) => ({
  label,
  offset: (LAST_OFFSET / (LABELS.length - 1)) * index,
}));

const dotCentre = (offset: number) => `calc(${offset}% + 22px)`;

interface Props {
  roundQualified: number;
}

// Figma 323:1969–323:1984 + mascot 325:364. Coordinates are relative to the
// track's top-left (frame 124, 215).
export function Timeline({ roundQualified }: Props) {
  const current = timelineMilestone(roundQualified);
  const fill = dotCentre(MILESTONES[current].offset);

  return (
    <div className="relative">
      <h2 className="font-timeline text-[36px] leading-[25.075px] text-dash-ink capitalize lg:absolute lg:-top-[87px] lg:left-0 lg:text-[48px] lg:whitespace-nowrap">
        timeline:
      </h2>
      <div
        role="progressbar"
        aria-label="Contest progress"
        aria-valuemin={0}
        aria-valuemax={MILESTONES.length - 1}
        aria-valuenow={current}
        aria-valuetext={MILESTONES[current].label}
        className="relative mt-[87px] mr-[48px] h-[44.399px] rounded-[70px] bg-dash-track lg:mt-0 lg:mr-0 lg:w-[1402px]"
      >
        <div
          className="absolute top-0 left-0 h-[44px] rounded-[70px] bg-brand-accent opacity-75"
          style={{ width: fill }}
        />
        {MILESTONES.map(milestone => (
          <TimelineFlag key={milestone.label} offset={milestone.offset} />
        ))}
        {MILESTONES.map(milestone => (
          <span
            key={milestone.label}
            className="absolute top-[58px] -translate-x-1/2 font-scratch-sans text-[20px] leading-[24.688px] font-bold whitespace-nowrap text-dash-label [font-variation-settings:'opsz'_14]"
            style={{ left: dotCentre(milestone.offset) }}
          >
            {milestone.label}
          </span>
        ))}
        <Image
          src="/dashboard/mascot.png"
          alt=""
          width={74}
          height={74}
          className="absolute -top-[16px] size-[74px] max-w-none object-cover"
          style={{ left: `calc(${fill} - 37px)` }}
        />
      </div>
    </div>
  );
}

// Figma component `Group 1707478417` (275:3234): white dot + tilted finish flag.
function TimelineFlag({ offset }: { offset: number }) {
  return (
    <div
      aria-hidden
      className="absolute -top-[71px] h-[116.772px] w-[88px]"
      style={{ left: `${offset}%` }}
    >
      <Image
        src="/dashboard/flag-dot.svg"
        alt=""
        width={44}
        height={44}
        unoptimized
        className="absolute top-[70.4px] left-0 size-[44px] max-w-none"
      />
      <div
        className="absolute inset-[0_0_0_3.41%] flex items-center justify-center"
        style={{ containerType: 'size' }}
      >
        <div className="relative h-[hypot(-35.1123cqw,85.9553cqh)] w-[hypot(64.8877cqw,14.0447cqh)] flex-none rotate-[16.56deg]">
          <Image
            src="/dashboard/finish-flag.png"
            alt=""
            fill
            sizes="58px"
            className="pointer-events-none object-contain"
          />
        </div>
      </div>
    </div>
  );
}
