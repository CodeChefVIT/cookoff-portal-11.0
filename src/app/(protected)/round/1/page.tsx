import { RoundEntry, RoundGate } from '@/components/rounds';

// ROUND 1 - No question list: redirects to the round's first question.
export default function RoundOnePage() {
  return (
    <RoundGate roundId={1}>
      <RoundEntry roundId={1} />
    </RoundGate>
  );
}
