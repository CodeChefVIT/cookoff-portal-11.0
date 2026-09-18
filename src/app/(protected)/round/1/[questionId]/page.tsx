import { RoundGate, RoundShell } from '@/components/rounds';
import { ChainSubmitButton, VisualQuestionWorkspace } from '@/components/rounds/round-1';

// ROUND 1 - Single question (Scratch). Submit lives in the header, not the workspace (RoundConfig.headerSubmit).
export interface RoundOneQuestionPageProps {
  params: Promise<{ questionId: string }>;
}

export default async function RoundOneQuestionPage({ params }: RoundOneQuestionPageProps) {
  const { questionId: rawQuestionId } = await params;
  // UUIDs are canonically lowercase and the server echoes them that way.
  // Normalising here keeps the header's Submit button (which only has the
  // route param) keyed identically to the workspace (which uses the
  // server's `question.id`), so a shared URL in another case still works.
  const questionId = rawQuestionId.toLowerCase();

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
