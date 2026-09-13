import { QuestionList, RoundGate, RoundShell } from '@/components/rounds';

// ROUND 1 - Question list ("Scratch").
export default function RoundOnePage() {
  return (
    <RoundGate roundId={1}>
      <RoundShell roundId={1}>
        <QuestionList roundId={1} />
      </RoundShell>
    </RoundGate>
  );
}
