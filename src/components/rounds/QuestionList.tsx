/**
 * SHARED QUESTION LIST
 *
 * Displays a grid of questions for a specific round.
 * Fetches data from `GET /question/round`.
 * Each item links to `/round/[roundId]/[questionId]`.
 */
export interface QuestionListProps {
  /** Which round's questions to fetch and display (1, 2, or 3). */
  roundId: number;
}

export function QuestionList({ roundId }: QuestionListProps) {
  void roundId;
  // Fetch questions for this round
  return <div className="question-list"></div>;
}
