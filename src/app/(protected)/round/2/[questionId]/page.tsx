import { RoundGate, RoundShell } from '@/components/rounds';
import { QuestionWorkspace } from '@/components/rounds/round-2-3';

// ROUND 2 - Single question (Code, buy-in gated).
export interface RoundTwoQuestionPageProps {
  params: Promise<{ questionId: string }>;
}

export default async function RoundTwoQuestionPage({ params }: RoundTwoQuestionPageProps) {
  const { questionId: rawQuestionId } = await params;
  // UUIDs are canonically lowercase and the server echoes them that way.
  // Normalising here keeps the header's Submit button (which only has the
  // route param) keyed identically to the workspace (which uses the
  // server's `question.id`), so a shared URL in another case still works.
  const questionId = rawQuestionId.toLowerCase();

  return (
    <RoundGate roundId={2}>
      <RoundShell roundId={2} activeQuestionId={questionId}>
        <QuestionWorkspace roundId={2} questionId={questionId} />
      </RoundShell>
    </RoundGate>
  );
}
