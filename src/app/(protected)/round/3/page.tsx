import { RoundEntry, RoundGate } from '@/components/rounds';

// ROUND 3 - No question list: redirects to the round's first question.
export default function RoundThreePage() {
  return (
    <RoundGate roundId={3}>
      <RoundEntry roundId={3} />
    </RoundGate>
  );
}
