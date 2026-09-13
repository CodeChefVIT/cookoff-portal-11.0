import { RoundGate, RoundShell } from '@/components/rounds';
import { QuestionWorkspace } from '@/components/rounds/round-2-3';

// ROUND 2 - Single question (Code, buy-in gated).
export interface RoundTwoQuestionPageProps {
  params: Promise<{ questionId: string }>;
}

export default async function RoundTwoQuestionPage({ params }: RoundTwoQuestionPageProps) {
  const { questionId } = await params;
  return (
    <RoundGate roundId={2}>
      <RoundShell roundId={2} activeQuestionId={questionId}>
        <QuestionWorkspace roundId={2} questionId={questionId} />
      </RoundShell>
    </RoundGate>
  );
}
