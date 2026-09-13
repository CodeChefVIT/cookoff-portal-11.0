import { getRoundConfig } from './round-config';
import { RoundTimer } from './RoundTimer';

export type IntermissionVariant = 'pending' | 'ended' | 'notQualified' | 'finished';

export interface RoundIntermissionProps {
  roundId: 2 | 3;
  variant: IntermissionVariant;
}

/**
 * Full-viewport screens for every non-`LIVE` `RoundGate` state. Copy is
 * data-driven from `round-config.ts` so product can edit it without a
 * component change (product doc gave R2/R3 intent but no final copy).
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

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <p className="text-xs tracking-widest text-muted-foreground uppercase">{config.label}</p>
      <h1 className="font-display text-3xl text-brand sm:text-4xl">{heading}</h1>
      <p className="max-w-md text-sm text-muted-foreground sm:text-base">{body}</p>
      {variant === 'pending' && <RoundTimer />}
    </div>
  );
}
