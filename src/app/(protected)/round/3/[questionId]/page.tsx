import { RoundGate, RoundShell } from '@/components/rounds';
import { QuestionWorkspace } from '@/components/rounds/round-2-3';

// ROUND 3 - Single question (Code, unlocked by default, no currency box).
export interface RoundThreeQuestionPageProps {
  params: Promise<{ questionId: string }>;
}

export default async function RoundThreeQuestionPage({ params }: RoundThreeQuestionPageProps) {
  const { questionId } = await params;
  return (
    <RoundGate roundId={3}>
      <RoundShell roundId={3} activeQuestionId={questionId}>
        <QuestionWorkspace roundId={3} questionId={questionId} />
      </RoundShell>
    </RoundGate>
  );
}
