// ROUND 2 - Single question (Code).
// TODO: Wrap in <BuyInGate> + render <CodeEngine>. Uses GET /testcases,
// POST /submit, and polling via GET /result/:submission_id.
export interface RoundTwoQuestionPageProps {
  params: { questionId: string };
}

export default function RoundTwoQuestionPage({ params }: RoundTwoQuestionPageProps) {
  return <div>Round 2 Question {params.questionId}</div>;
}
