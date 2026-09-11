// ROUND 1 - Single question (Scratch).
// TODO: Wrap in <BuyInGate> + fetch blocks (GET /question/:id/blocks),
// then render <ScratchEngine>. Submit goes to (api)/submit/visual.
export interface RoundOneQuestionPageProps {
  params: { questionId: string };
}

export default function RoundOneQuestionPage({ params }: RoundOneQuestionPageProps) {
  return <div>Round 1 Question {params.questionId}</div>;
}
