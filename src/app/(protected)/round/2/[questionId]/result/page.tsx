// ROUND 2 - Submission result.
// TODO: Show <ResultModal> after the Judge0 polling finishes.
export interface RoundTwoResultPageProps {
  params: { questionId: string };
}

export default function RoundTwoResultPage({ params }: RoundTwoResultPageProps) {
  void params;
  return <div>Round 2 Result</div>;
}
