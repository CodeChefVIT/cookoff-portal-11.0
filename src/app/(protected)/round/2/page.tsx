import { RoundEntry, RoundGate } from '@/components/rounds';

// ROUND 2 - No question list: redirects to the round's first question.
export default function RoundTwoPage() {
  return (
    <RoundGate roundId={2}>
      <RoundEntry roundId={2} />
    </RoundGate>
  );
}
