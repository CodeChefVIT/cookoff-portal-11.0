import { RoundGate, RoundShell } from '@/components/rounds';
import { ChainSubmitButton, VisualQuestionWorkspace } from '@/components/rounds/round-1';

// ROUND 1 - Single question (Scratch). Submit lives in the header, not the workspace (RoundConfig.headerSubmit).
export interface RoundOneQuestionPageProps {
  params: Promise<{ questionId: string }>;
}

export default async function RoundOneQuestionPage({ params }: RoundOneQuestionPageProps) {
  const { questionId } = await params;
  return (
    <RoundGate roundId={1}>
      <RoundShell
        roundId={1}
        activeQuestionId={questionId}
        headerAction={<ChainSubmitButton questionId={questionId} />}
      >
        <VisualQuestionWorkspace questionId={questionId} />
      </RoundShell>
    </RoundGate>
  );
}
