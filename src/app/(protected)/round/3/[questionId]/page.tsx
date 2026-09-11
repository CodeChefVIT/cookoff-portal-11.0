// ROUND 3 - Single question (Code, no currency box).
// TODO: Same as Round 2 but <RoundShell> hides the <CurrencyBox> (roundId === 3).
// Uses GET /testcases, POST /submit, and GET /result/:submission_id.
export interface RoundThreeQuestionPageProps {
  params: { questionId: string };
}

export default function RoundThreeQuestionPage({ params }: RoundThreeQuestionPageProps) {
  return <div>Round 3 Question {params.questionId}</div>;
}
