import { RoundGate, RoundShell } from '@/components/rounds';
import { QuestionWorkspace } from '@/components/rounds/round-2-3';

// ROUND 3 - Single question (Code, unlocked by default, no currency box).
export interface RoundThreeQuestionPageProps {
  params: Promise<{ questionId: string }>;
}

export default async function RoundThreeQuestionPage({ params }: RoundThreeQuestionPageProps) {
  const { questionId: rawQuestionId } = await params;
  // UUIDs are canonically lowercase and the server echoes them that way.
  // Normalising here keeps the header's Submit button (which only has the
  // route param) keyed identically to the workspace (which uses the
  // server's `question.id`), so a shared URL in another case still works.
  const questionId = rawQuestionId.toLowerCase();

  return (
    <RoundGate roundId={3}>
      <RoundShell roundId={3} activeQuestionId={questionId}>
        <QuestionWorkspace roundId={3} questionId={questionId} />
      </RoundShell>
    </RoundGate>
  );
}
