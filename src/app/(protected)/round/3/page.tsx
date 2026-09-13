import { QuestionList, RoundGate, RoundShell } from '@/components/rounds';

// ROUND 3 - Question list ("the Crucible").
export default function RoundThreePage() {
  return (
    <RoundGate roundId={3}>
      <RoundShell roundId={3}>
        <QuestionList roundId={3} />
      </RoundShell>
    </RoundGate>
  );
}
