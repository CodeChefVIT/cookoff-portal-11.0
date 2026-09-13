import { QuestionList, RoundGate, RoundShell } from '@/components/rounds';

// ROUND 2 - Question list ("Chef's Pantry").
export default function RoundTwoPage() {
  return (
    <RoundGate roundId={2}>
      <RoundShell roundId={2}>
        <QuestionList roundId={2} />
      </RoundShell>
    </RoundGate>
  );
}
